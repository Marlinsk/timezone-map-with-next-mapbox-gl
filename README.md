# Timezones Map

This project renders an **interactive map of time zones (UTC)** using [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js) and **GeoJSON** data.

The application displays:

- Vertical time zone bands (UTC -12 to UTC +14) with soft colors.
- "UTC±X" labels aligned at the bottom of the map.
- Countries colored according to their actual time zone.
- Hover effect, highlighting the time zone and its countries.

## Requirements

- **Node.js**: `>= 20.11.0`  
- **pnpm**  
- **Next.js 15**  
- **Mapbox GL JS 3.14.0**  
- Valid [Mapbox](https://account.mapbox.com/) access token.

> Note: It is necessary to have knowledge in configuring setup of projects made in Node.js and command line of the terminal of the operating system used. 

## Main dependencies

- `next`  
- `react` e `react-dom`  
- `mapbox-gl`  
- `geojson` (tipagens)  

## Configuring project setup

Follow the steps below to configure the dependencies to run the project on your machine without stress.

#### Step 1: Installing `timezones.geojson` file

The map requires a GeoJSON file with **time zone polygons** to work. This file can be obtained from a compressed version (`timezones.json.zip`).

You can download the updated timezone package from the [evansiroky/timezone-boundary-builder/releases](https://github.com/evansiroky/timezone-boundary-builder/releases) data repository or another trusted source. 

#### Step 2: Placing file in project

After download the updated timezone package go to the project and create a **public folder** and inside it create a **data folder**. Inside it insert the unzipped file with the file type changed from `timezone.json` to `timezone.geojson`.

#### Step 3: Setting up the Mapbox token

This project uses **Mapbox GL JS** and requires a valid **Access Token** to load the map style and tiles.

1. Go to **https://account.mapbox.com/**
2. Create/log in to your account.
3. Go to **Tokens** and copy the token (starting with `pk.`) that is already available by default or create one according to your preferences.

> Note: Mapbox public tokens **can** remain in the client, but **must** be restricted by domain/URL.

4. Go back to projet and create a **.env.local** file in the root (or edit the existing one) and add:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.seu_token_aqui
```

> Note: Variables that will be used in the browser must start with `NEXT_PUBLIC_`.

#### Step 4: Running project

The project was developed using the pnpm package manager, and therefore we recommend using it in the project.

If you don't have it installed on your node, enter the following command in your terminal:

```bash
npm install -g pnpm@latest
```

Run this command to install the project dependencies:

```bash
pnpm install
```

After installing the dependencies, run the project in developer mode and see the map render in your browser.

```bash
pnpm dev
```
