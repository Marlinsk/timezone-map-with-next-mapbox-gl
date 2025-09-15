# 🌍 Timezones Map

Este projeto renderiza um **mapa interativo dos fusos horários (UTC)** utilizando [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js) e dados em **GeoJSON**.

A aplicação exibe:

- Faixas verticais dos fusos (UTC -12 até UTC +14) com cores suaves.
- Labels "UTC±X" alinhados no rodapé do mapa.
- Países coloridos de acordo com o fuso horário real.
- Efeito de **hover**, destacando o fuso horário e seus países.

## 🚀 Requisitos

- **Node.js**: `>= 20.11.0`  
- **pnpm**  
- **Next.js 15**  
- **Mapbox GL JS 3.14.0**  
- Token de acesso válido da [Mapbox](https://account.mapbox.com/).


## 📦 Dependências principais

- `next`  
- `react` e `react-dom`  
- `mapbox-gl`  
- `geojson` (tipagens)  
