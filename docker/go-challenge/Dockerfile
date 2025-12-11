FROM golang:1.23-alpine AS go-builder

WORKDIR /app

RUN apk add --no-cache binutils upx

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o app .

RUN strip app

RUN upx --best --lzma app

FROM scratch

COPY --from=go-builder /app/app /app
ENTRYPOINT ["/app"]
