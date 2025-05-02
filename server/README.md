# API do pobierania zamówień z idoSell

Aplikacja serwerowa do pobierania, przetwarzania i udostępniania zamówień z API idoSell (wersja 5).

## 🔐 Domyślne dane logowania

| Pole     | Wartość        |
|----------|----------------|
| **Login**  | `admin`         |
| **Hasło**  | `password123`   |


## Funkcjonalności

- Pobieranie zamówień z API idoSell
- Automatyczna aktualizacja danych co 24h
- Przechowywanie danych lokalnie
- Eksport zamówień do CSV
- Filtrowanie zamówień według wartości
- Zabezpieczenie API za pomocą Basic Auth

## Wymagania

- Node.js (wersja >= 14.0.0)
- npm lub yarn

## Instalacja

1. Sklonuj repozytorium lub pobierz pliki
2. Przejdź do katalogu server
3. Zainstaluj zależności:

```bash
npm install
```

## Uruchomienie aplikacji

### Tryb deweloperski

```bash
npm run dev
```

### Budowanie i uruchomienie produkcyjne

```bash
npm run build
npm start
```

## Konfiguracja

Konfiguracja aplikacji znajduje się w pliku `src/config.ts`. Możesz dostosować:

- Port serwera
- Dane uwierzytelniające API (username, password)
- Parametry harmonogramu zadań
- Dane dostępowe do API idoSell

W produkcji zalecane jest ustawienie zmiennych środowiskowych:

- `PORT` - port serwera
- `API_KEY` - klucz do API
- `PANEL_URL` - adres URL panelu
- `API_USERNAME` - nazwa użytkownika do Basic Auth
- `API_PASSWORD` - hasło do Basic Auth
- `DAILY_CRON` - wyrażenie cron dla zadania codziennego (domyślnie '0 0 \* \* \*')

## Endpointy API

Wszystkie endpointy wymagają uwierzytelnienia Basic Auth.

### GET /api/orders

Pobiera listę zamówień z możliwością filtrowania.

**Parametry zapytania:**

- `minWorth` - minimalna wartość zamówienia (opcjonalnie)
- `maxWorth` - maksymalna wartość zamówienia (opcjonalnie)

Przykładowa odpowiedź:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "orderID": "12345",
      "products": [
        {
          "productID": "P123",
          "quantity": 2
        }
      ],
      "orderWorth": 299.99,
      "date": "2023-11-24T12:30:45.123Z"
    }
  ]
}
```

### GET /api/orders/csv

Pobiera listę zamówień w formacie CSV.

**Parametry zapytania:**

- `minWorth` - minimalna wartość zamówienia (opcjonalnie)
- `maxWorth` - maksymalna wartość zamówienia (opcjonalnie)

### GET /api/orders/:id

Pobiera szczegóły konkretnego zamówienia po ID.

### GET /api/orders/:id/csv

Pobiera szczegóły konkretnego zamówienia w formacie CSV.

### POST /api/orders/refresh

Wymusza ręczne odświeżenie danych z API idoSell.

## Automatyczne aktualizacje

Aplikacja automatycznie pobiera dane z API idoSell:

- Przy starcie aplikacji
- Codziennie o północy (lub zgodnie z ustawionym harmonogramem)

## Użyte endpointy API idoSell

Aplikacja korzysta z następujących endpointów API idoSell v5:

- `POST /api/admin/v5/orders/orders/search` - wyszukiwanie i pobieranie listy zamówień
- `GET /api/admin/v5/orders/orders` - pobieranie wszystkich zamówień (alternatywnie)

## Struktura projektu

```
server/
├── src/                 # Kod źródłowy
│   ├── config/          # Konfiguracja aplikacji
    ├── e2e/             # Testy end-to-end
│   ├── app.ts           # Główny plik aplikacji
│   ├── controllers/     # Kontrolery HTTP
│   ├── routes/          # Routing API
│   ├── middlewares/     # Middleware (np. uwierzytelnianie)
│   ├── services/        # Serwisy biznesowe
│   ├── models/          # Modele danych
│   ├── schedulers/      # Harmonogram zadań
│   └── types/           # Definicje typów TypeScript
├── data/                # Katalog do przechowywania danych
├── dist/                # Skompilowany kod (po zbudowaniu)
├── package.json         # Zależności i skrypty
└── tsconfig.json        # Konfiguracja TypeScript
```

## Testy end-to-end (E2E)

Aplikacja zawiera również testy end-to-end z wykorzystaniem Playwright. Testy te sprawdzają działanie API w środowisku zbliżonym do produkcyjnego.

### Uruchamianie testów E2E

```bash
# Uruchom wszystkie testy e2e
npm run test:e2e

# Uruchom testy e2e w trybie debug (z wizualizacją)
npm run test:e2e:debug

# Alternatywnie można użyć skryptu shell
chmod +x ./e2e-test.sh
./e2e-test.sh
```

### Struktura testów E2E

- `e2e/orders.spec.ts` - testy podstawowych operacji na zamówieniach
- `e2e/export.spec.ts` - testy funkcji eksportu do CSV
- `e2e/setup.ts` - pomocnicze funkcje dla testów
- `e2e/global-setup.ts` - konfiguracja środowiska testowego

### Dobre praktyki testów E2E

1. Testy E2E powinny sprawdzać krytyczne ścieżki użytkownika
2. Testy powinny być niezależne od siebie
3. Unikaj testowania szczegółów implementacji, skupiaj się na testowaniu funkcjonalności
4. Używaj zmiennych środowiskowych, aby nie zaśmiecać prawdziwej bazy danych
