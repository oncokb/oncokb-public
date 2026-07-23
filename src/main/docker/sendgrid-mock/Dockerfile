FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY main.go ./main.go

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /sendgrid-mock ./main.go

FROM alpine:3.20

RUN adduser -D -u 10001 appuser
USER appuser

COPY --from=builder /sendgrid-mock /usr/local/bin/sendgrid-mock

EXPOSE 8080

ENV LISTEN_ADDR=:8080

ENTRYPOINT ["/usr/local/bin/sendgrid-mock"]
