package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

type asmGroup struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	IsDefault   bool   `json:"is_default"`
}

type suppressionStore struct {
	mu           sync.RWMutex
	groups       []asmGroup
	suppressions map[int64]map[string]bool
}

func newSuppressionStore() *suppressionStore {
	groups := []asmGroup{
		{ID: 1001, Name: "Developers", Description: "Developer updates", IsDefault: false},
		{ID: 1002, Name: "Scientific News", Description: "Scientific news updates", IsDefault: false},
		{ID: 1003, Name: "All Users", Description: "General product updates", IsDefault: true},
		{ID: 1004, Name: "Custom", Description: "Custom audience emails", IsDefault: false},
	}

	return &suppressionStore{
		groups:       groups,
		suppressions: make(map[int64]map[string]bool),
	}
}

func (s *suppressionStore) groupsForEmail(email string) []map[string]any {
	normalizedEmail := strings.ToLower(strings.TrimSpace(email))
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]map[string]any, 0, len(s.groups))
	for _, group := range s.groups {
		suppressed := false
		if groupSuppressions, exists := s.suppressions[group.ID]; exists {
			suppressed = groupSuppressions[normalizedEmail]
		}
		result = append(result, map[string]any{
			"id":          group.ID,
			"name":        group.Name,
			"description": group.Description,
			"is_default":  group.IsDefault,
			"suppressed":  suppressed,
		})
	}

	return result
}

func (s *suppressionStore) addSuppression(groupID int64, email string) bool {
	normalizedEmail := strings.ToLower(strings.TrimSpace(email))
	if normalizedEmail == "" {
		return false
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.isKnownGroup(groupID) {
		return false
	}

	if _, exists := s.suppressions[groupID]; !exists {
		s.suppressions[groupID] = make(map[string]bool)
	}
	s.suppressions[groupID][normalizedEmail] = true
	return true
}

func (s *suppressionStore) removeSuppression(groupID int64, email string) bool {
	normalizedEmail := strings.ToLower(strings.TrimSpace(email))
	if normalizedEmail == "" {
		return false
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.isKnownGroup(groupID) {
		return false
	}

	if _, exists := s.suppressions[groupID]; !exists {
		return true
	}
	delete(s.suppressions[groupID], normalizedEmail)
	return true
}

func (s *suppressionStore) isKnownGroup(groupID int64) bool {
	for _, group := range s.groups {
		if group.ID == groupID {
			return true
		}
	}
	return false
}

type app struct {
	store *suppressionStore
}

func main() {
	listenAddr := getenvDefault("LISTEN_ADDR", ":8080")
	a := &app{store: newSuppressionStore()}

	mux := http.NewServeMux()
	mux.HandleFunc("/", a.handleRequest)

	server := &http.Server{
		Addr:              listenAddr,
		Handler:           mux,
		ReadHeaderTimeout: 10 * time.Second,
	}

	log.Printf("sendgrid-mock: listening on %s", listenAddr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("sendgrid-mock: server error: %v", err)
	}
}

func (a *app) handleRequest(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("sendgrid-mock: failed to read request body: %v", err)
		http.Error(w, "failed to read request body", http.StatusBadRequest)
		return
	}

	log.Printf("---- sendgrid-mock request start ----")
	log.Printf("method=%s path=%s proto=%s remote=%s", r.Method, r.URL.Path, r.Proto, r.RemoteAddr)
	log.Printf("query=%s", r.URL.RawQuery)

	headers := make([]string, 0, len(r.Header))
	for k := range r.Header {
		headers = append(headers, k)
	}
	sort.Strings(headers)
	for _, k := range headers {
		log.Printf("header[%s]=%s", k, strings.Join(r.Header.Values(k), ", "))
	}

	if len(body) == 0 {
		log.Printf("payload=<empty>")
	} else {
		log.Printf("payload=%s", string(body))
	}

	if !strings.HasPrefix(r.URL.Path, "/v3/") {
		writeJSON(w, http.StatusNotFound, map[string]any{
			"errors": []map[string]any{{
				"message": fmt.Sprintf("unknown path: %s", r.URL.Path),
				"field":   nil,
				"help":    nil,
			}},
		})
		log.Printf("---- sendgrid-mock request end ----")
		return
	}

	if r.Method == http.MethodPost && r.URL.Path == "/v3/mail/send" {
		a.handleMailSend(w, body)
		log.Printf("---- sendgrid-mock request end ----")
		return
	}

	if r.Method == http.MethodGet && strings.HasPrefix(r.URL.Path, "/v3/asm/suppressions/") {
		a.handleGetSuppressions(w, r.URL.Path)
		log.Printf("---- sendgrid-mock request end ----")
		return
	}

	if strings.HasPrefix(r.URL.Path, "/v3/asm/groups/") {
		a.handleGroupSuppressions(w, r.Method, r.URL.Path, body)
		log.Printf("---- sendgrid-mock request end ----")
		return
	}

	writeJSON(w, http.StatusNotFound, map[string]any{
		"errors": []map[string]any{{
			"message": fmt.Sprintf("unsupported endpoint: %s %s", r.Method, r.URL.Path),
			"field":   nil,
			"help":    nil,
		}},
	})
	log.Printf("---- sendgrid-mock request end ----")
}

func (a *app) handleMailSend(w http.ResponseWriter, body []byte) {
	if len(strings.TrimSpace(string(body))) == 0 {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"errors": []map[string]any{{
				"message": "request body is required",
				"field":   "body",
				"help":    "https://docs.sendgrid.com/api-reference/mail-send/mail-send",
			}},
		})
		return
	}

	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"errors": []map[string]any{{
				"message": "invalid json payload",
				"field":   "body",
				"help":    "https://docs.sendgrid.com/api-reference/mail-send/mail-send",
			}},
		})
		return
	}

	if _, ok := payload["template_id"]; !ok {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"errors": []map[string]any{{
				"message": "template_id is required",
				"field":   "template_id",
				"help":    "https://docs.sendgrid.com/api-reference/mail-send/mail-send",
			}},
		})
		return
	}

	if _, ok := payload["personalizations"]; !ok {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"errors": []map[string]any{{
				"message": "personalizations is required",
				"field":   "personalizations",
				"help":    "https://docs.sendgrid.com/api-reference/mail-send/mail-send",
			}},
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Message-Id", fmt.Sprintf("mock-%d", time.Now().UnixNano()))
	w.WriteHeader(http.StatusAccepted)
	_, _ = w.Write([]byte(""))
}

func (a *app) handleGetSuppressions(w http.ResponseWriter, path string) {
	emailPart := strings.TrimPrefix(path, "/v3/asm/suppressions/")
	email, err := url.PathUnescape(emailPart)
	if err != nil || strings.TrimSpace(email) == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"errors": []map[string]any{{
				"message": "invalid email path parameter",
				"field":   "email",
				"help":    nil,
			}},
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"suppressions": a.store.groupsForEmail(email),
	})
}

func (a *app) handleGroupSuppressions(w http.ResponseWriter, method, path string, body []byte) {
	trimmed := strings.TrimPrefix(path, "/v3/asm/groups/")
	parts := strings.Split(trimmed, "/")
	if len(parts) < 2 {
		writeJSON(w, http.StatusNotFound, map[string]any{
			"errors": []map[string]any{{"message": "invalid group path"}},
		})
		return
	}

	groupID, err := strconv.ParseInt(parts[0], 10, 64)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"errors": []map[string]any{{"message": "invalid group id", "field": "groupId"}},
		})
		return
	}

	if len(parts) == 2 && parts[1] == "suppressions" && method == http.MethodPost {
		var payload struct {
			RecipientEmails []string `json:"recipient_emails"`
		}
		if err := json.Unmarshal(body, &payload); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]any{
				"errors": []map[string]any{{"message": "invalid json payload", "field": "body"}},
			})
			return
		}
		if len(payload.RecipientEmails) == 0 {
			writeJSON(w, http.StatusBadRequest, map[string]any{
				"errors": []map[string]any{{"message": "recipient_emails is required", "field": "recipient_emails"}},
			})
			return
		}

		added := []string{}
		for _, email := range payload.RecipientEmails {
			if a.store.addSuppression(groupID, email) {
				added = append(added, strings.ToLower(strings.TrimSpace(email)))
			}
		}
		if len(added) == 0 {
			writeJSON(w, http.StatusNotFound, map[string]any{
				"errors": []map[string]any{{"message": "group not found or no valid email"}},
			})
			return
		}

		writeJSON(w, http.StatusCreated, map[string]any{
			"recipient_emails": added,
		})
		return
	}

	if len(parts) == 3 && parts[1] == "suppressions" && method == http.MethodDelete {
		email, decodeErr := url.PathUnescape(parts[2])
		if decodeErr != nil {
			writeJSON(w, http.StatusBadRequest, map[string]any{
				"errors": []map[string]any{{"message": "invalid email path parameter", "field": "email"}},
			})
			return
		}
		if !a.store.removeSuppression(groupID, email) {
			writeJSON(w, http.StatusNotFound, map[string]any{
				"errors": []map[string]any{{"message": "group not found"}},
			})
			return
		}
		w.WriteHeader(http.StatusNoContent)
		return
	}

	writeJSON(w, http.StatusNotFound, map[string]any{
		"errors": []map[string]any{{"message": fmt.Sprintf("unsupported endpoint: %s %s", method, path)}},
	})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	encoded, err := json.Marshal(payload)
	if err != nil {
		_, _ = w.Write([]byte(`{"errors":[{"message":"failed to marshal response"}]}`))
		return
	}
	_, _ = w.Write(encoded)
}

func getenvDefault(key, fallback string) string {
	v := os.Getenv(key)
	if strings.TrimSpace(v) == "" {
		return fallback
	}
	return v
}
