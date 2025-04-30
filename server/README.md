# API idoSell - Pobieranie i Analiza Zamówień

Aplikacja backendowa do pobierania, przetwarzania i udostępniania danych zamówień z API idoSell. Napisana w Node.js z TypeScript i Express.js.

## Funkcje

- Pobieranie zamówień z API idoSell
- Wyciąganie informacji o sprzedanych produktach i wartości zamówień
- Codzienne aktualizacje danych
- REST API do pobierania zamówień w formatach JSON i CSV
- Możliwość filtrowania zamówień po wartości (minWorth, maxWorth)
- Zabezpieczenie API przez Basic Auth

## Wymagania

- Node.js (wersja >= 14)
- npm lub yarn

## Instalacja

1. Sklonuj repozytorium lub pobierz pliki
2. Zainstaluj zależności:

```bash
cd server
npm install
```

3. Skonfiguruj zmienne środowiskowe:
   
Stwórz plik `.env` w katalogu głównym projektu i dodaj:

```
POR
API_KEY
API_URL
BASIC_AUTH_USERNAME
BASIC_AUTH_PASSWORD
```

## Uruchomienie

### Tryb deweloperski

```bash
npm run dev
```

### Tryb produkcyjny

```bash
npm run build
npm start
```

## Dostępne endpointy

- `GET /api/orders` - Pobierz wszystkie zamówienia
- `GET /api/orders?minWorth=100&maxWorth=500` - Pobierz zamówienia o wartości od 100 do 500
- `GET /api/orders/:id` - Pobierz konkretne zamówienie po ID
- `GET /api/orders/export/csv` - Eksportuj wszystkie zamówienia do pliku CSV
- `GET /api/orders/export/csv?minWorth=100&maxWorth=500` - Eksportuj zamówienia o wartości od 100 do 500
- `POST /api/orders/update` - Ręczna aktualizacja zamówień (zwykle wykonywana automatycznie o północy)

## Uwagi

Dane zamówień są przechowywane w folderze `data/` jako plik JSON. 