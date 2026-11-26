package payroll

import (
	"fmt"
	"math"
	"strconv"
	"strings"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/settings"
)

// Keep the rounding and operation order of the legacy JavaScript calculation.
func round(value float64) int64 {
	floor := math.Floor(value)
	if value-floor >= 0.5 {
		floor++
	}
	return int64(floor)
}

func rupiah(value int64) string {
	text := strconv.FormatInt(value, 10)
	digits := strings.TrimPrefix(text, "-")
	for i := len(digits) - 3; i > 0; i -= 3 {
		digits = digits[:i] + "." + digits[i:]
	}
	if value < 0 {
		return "-" + digits
	}
	return digits
}

type contributions struct {
	healthEmployee, healthEmployer, jhtEmployee, jhtEmployer int64
	jpEmployee, jpEmployer, jkkEmployer, jkmEmployer         int64
}

func calculateBPJS(wage int64, cfg settings.CompanySetting, health, employment bool) contributions {
	base := max(wage, int64(cfg.BPJSMinimumWage))
	kes, jp := min(base, int64(cfg.BPJSKesehatanWageCap)), min(base, int64(cfg.JPWageCap))
	pct := func(amount int64, rate float64) int64 { return round(float64(amount) * rate) }
	var result contributions
	if health {
		result.healthEmployee, result.healthEmployer = pct(kes, .01), pct(kes, .04)
	}
	if employment {
		result.jhtEmployee, result.jhtEmployer = pct(base, .02), pct(base, .037)
		result.jpEmployee, result.jpEmployer = pct(jp, .01), pct(jp, .02)
		result.jkkEmployer, result.jkmEmployer = pct(base, float64(cfg.JKKRateBps)/10000), pct(base, .003)
	}
	return result
}

type taxProfile struct {
	exemption int64
	category  byte
	label     string
}

var taxProfiles = map[string]taxProfile{
	"TK0": {54000000, 'A', "TK/0"}, "TK1": {58500000, 'A', "TK/1"},
	"TK2": {63000000, 'B', "TK/2"}, "TK3": {67500000, 'B', "TK/3"},
	"K0": {58500000, 'A', "K/0"}, "K1": {63000000, 'B', "K/1"},
	"K2": {67500000, 'B', "K/2"}, "K3": {72000000, 'C', "K/3"},
}

func monthlyTax(profile taxProfile, gross int64) (int64, string) {
	rate := rateTER(profile.category, gross)
	tax := int64(math.Floor(float64(gross) * rate / 100))
	return tax, fmt.Sprintf("TER %c %s%%", profile.category, strconv.FormatFloat(rate, 'f', -1, 64))
}

var pasal17 = [...]struct {
	limit int64
	rate  float64
}{
	{60000000, .05}, {250000000, .15}, {500000000, .25}, {5000000000, .3}, {math.MaxInt64, .35},
}

func pasal17Tax(pkp int64) int64 {
	remaining, previous := max(0, pkp), int64(0)
	tax := float64(0)
	for _, band := range pasal17 {
		slice := min(remaining, band.limit-previous)
		tax += float64(float64(slice) * band.rate)
		remaining, previous = remaining-slice, band.limit
		if remaining <= 0 {
			break
		}
	}
	return int64(math.Floor(tax))
}

type priorTax struct {
	Income, Pension, Withheld int64
	Months                    int
}

func annualTax(profile taxProfile, gross, pension int64, months int, withheld int64) (int64, string) {
	jobExpense := min(int64(math.Floor(float64(gross)*.05)), 500000*int64(months))
	pkp := max(0, (gross-jobExpense-pension-profile.exemption)/1000*1000)
	tax := pasal17Tax(pkp)
	return tax - withheld, "Pasal 17 (setahun Rp" + rupiah(tax) + ")"
}
