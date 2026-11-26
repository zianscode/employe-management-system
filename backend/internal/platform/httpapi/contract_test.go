package httpapi

import (
	"regexp"
	"strings"
	"testing"

	"github.com/fajarfauzian/employe_management_frontend/backend/api"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/employees"
	"github.com/fajarfauzian/employe_management_frontend/backend/internal/modules/identity"
)

func TestRoutesMatchOpenAPI(t *testing.T) {
	router := New(nil)
	RegisterBusiness(router, nil, &identity.Service{}, employees.AvatarStore{})
	path := regexp.MustCompile(`(?m)^  (/[^:\r\n]+):\r?$`)
	method := regexp.MustCompile(`(?m)^    (get|post|patch|put|delete|head|options):\r?$`)
	params := regexp.MustCompile(`:([a-zA-Z0-9_]+)`)
	sections := path.FindAllStringSubmatchIndex(api.OpenAPI, -1)
	documented := map[string]bool{}
	for index, section := range sections {
		end := len(api.OpenAPI)
		if index+1 < len(sections) {
			end = sections[index+1][0]
		}
		route := api.OpenAPI[section[2]:section[3]]
		for _, verb := range method.FindAllStringSubmatch(api.OpenAPI[section[1]:end], -1) {
			documented[strings.ToUpper(verb[1])+" "+route] = true
		}
	}
	for _, route := range router.Routes() {
		key := route.Method + " " + params.ReplaceAllString(route.Path, "{${1}}")
		if !documented[key] {
			t.Errorf("registered route missing from OpenAPI: %s", key)
		}
		delete(documented, key)
	}
	for route := range documented {
		t.Errorf("documented route is not registered: %s", route)
	}
}
