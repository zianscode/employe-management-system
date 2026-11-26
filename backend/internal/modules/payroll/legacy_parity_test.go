package payroll

import (
	"encoding/json"
	"os"
	"reflect"
	"strconv"
	"testing"

	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/employees"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/settings"
)

func TestLegacyPayrollParity(t *testing.T) {
	data, err := os.ReadFile("testdata/legacy-parity.json")
	if err != nil {
		t.Fatal(err)
	}
	var fixture struct {
		Settings settings.CompanySetting
		Cases    []struct {
			Name               string
			Month, Year        int
			BasicSalary        int32
			PTKP               string
			Health, Employment bool
			Components         []componentSnapshot
			OvertimeHours      float64
			UnpaidDays         int
			Previous           priorTax
			Want               Salary
		}
	}
	if err := json.Unmarshal(data, &fixture); err != nil {
		t.Fatal(err)
	}
	if len(fixture.Cases) != 43 {
		t.Fatalf("legacy fixture has %d recalculated slips, want 43", len(fixture.Cases))
	}
	for _, test := range fixture.Cases {
		t.Run(test.Name+"/"+strconv.Itoa(test.Month), func(t *testing.T) {
			person := employees.Employee{
				SalaryBase: test.BasicSalary, PTKPStatus: test.PTKP,
				BPJSKesehatan: test.Health, BPJSKetenagakerjaan: test.Employment,
			}
			input := payrollInputs{
				components: test.Components, overtimeHours: test.OvertimeHours,
				unpaidDays: test.UnpaidDays, previous: test.Previous,
			}
			actual, err := compute(person, fixture.Settings, test.Month, test.Year, input)
			if err != nil {
				t.Fatal(err)
			}
			want := test.Want
			components := func(row Salary) []componentSnapshot {
				t.Helper()
				if row.Components == nil {
					t.Fatal("missing component snapshot")
				}
				var result []componentSnapshot
				if err := json.Unmarshal(*row.Components, &result); err != nil {
					t.Fatal(err)
				}
				return result
			}
			if !reflect.DeepEqual(components(actual), components(want)) {
				t.Fatal("component snapshot differs from Prisma")
			}
			actual.ID, actual.PeriodMonth, actual.PeriodYear = "", 0, 0
			actual.Components, want.Components = nil, nil
			if !reflect.DeepEqual(actual, want) {
				t.Errorf("legacy values differ\nactual: %+v\nwant:   %+v", actual, want)
			}
		})
	}
}
