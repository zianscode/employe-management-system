package payroll

import (
	"testing"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/settings"
)

func TestPayrollRounding(t *testing.T) {
	for _, tc := range []struct {
		input float64
		want  int64
	}{{1.4999999999999998, 1}, {1.5, 2}, {-1.5, -1}, {-1.5000000000000002, -2}} {
		if got := round(tc.input); got != tc.want {
			t.Errorf("round(%v) = %d; want %d", tc.input, got, tc.want)
		}
	}
}

func TestTaxRules(t *testing.T) {
	for _, tc := range []struct {
		status      string
		gross, want int64
		method      string
	}{
		{"TK0", 5400000, 0, "TER A 0%"}, {"TK0", 5400001, 13500, "TER A 0.25%"},
		{"K1", 6200001, 15500, "TER B 0.25%"}, {"K3", 6600001, 16500, "TER C 0.25%"},
		{"K3", 1419000001, 482460000, "TER C 34%"},
	} {
		if got, method := monthlyTax(taxProfiles[tc.status], tc.gross); got != tc.want || method != tc.method {
			t.Errorf("%s at %d = %d, %s; want %d, %s", tc.status, tc.gross, got, method, tc.want, tc.method)
		}
	}
	if amount, method := annualTax(taxProfiles["TK0"], 120000000, 3600000, 12, 2200000); amount != 620000 || method != "Pasal 17 (setahun Rp2.820.000)" {
		t.Fatalf("December reconciliation = %d, %s", amount, method)
	}
	if amount, _ := annualTax(taxProfiles["K3"], 20000000, 0, 3, 1500000); amount != -1500000 {
		t.Fatalf("December refund = %d", amount)
	}
}

func TestBPJSLimits(t *testing.T) {
	cfg := settings.CompanySetting{BPJSKesehatanWageCap: 12000000, JPWageCap: 11086300, JKKRateBps: 24, BPJSMinimumWage: 5000000}
	if got := calculateBPJS(20000000, cfg, true, true); got.healthEmployee != 120000 || got.jpEmployee != 110863 || got.jhtEmployee != 400000 {
		t.Fatalf("incorrect BPJS caps: %+v", got)
	}
	if got := calculateBPJS(3000000, cfg, false, true); got.healthEmployee != 0 || got.jhtEmployee != 100000 {
		t.Fatalf("incorrect minimum or enrollment flag: %+v", got)
	}
}
