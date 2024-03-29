FROM alpine as alpine
RUN apk add -U --no-cache ca-certificates

FROM golang:alpine AS builder
COPY . /clippy
WORKDIR /clippy
RUN CGO_ENABLED=0 GOOS=linux go build -a -tags netgo -ldflags '-w' .

FROM scratch
WORKDIR /
COPY --from=alpine /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /clippy/clippy /clippy
ENTRYPOINT ["/clippy"]