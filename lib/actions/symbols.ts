"use server";

import { createClient } from "@/utils/supabase/server";

export const initDataCreate = async () => {
//   const categories = [
//     { slug: "forex", name: "Forex" },
//     { slug: "indices", name: "Indices" },
//     { slug: "crypto", name: "Crypto" },
//     { slug: "futures", name: "Futures" },
//     { slug: "stocks", name: "Stocks" },
//   ];

  const supabase = await createClient();

//   const { error } = await supabase.from("category").insert(categories);
//   if (error) return { isOk: false, error: error.message };

  const symbols = [
    /* -------- FOREX -------- */
    {
      name: "Euro / US Dollar",
      symbol: "EURUSD",
      isActive: true,
      type: "forex",
    },
    {
      name: "British Pound / US Dollar",
      symbol: "GBPUSD",
      isActive: true,
      type: "forex",
    },
    {
      name: "US Dollar / Japanese Yen",
      symbol: "USDJPY",
      isActive: true,
      type: "forex",
    },
    {
      name: "US Dollar / Swiss Franc",
      symbol: "USDCHF",
      isActive: true,
      type: "forex",
    },
    {
      name: "US Dollar / Canadian Dollar",
      symbol: "USDCAD",
      isActive: true,
      type: "forex",
    },
    {
      name: "Australian Dollar / US Dollar",
      symbol: "AUDUSD",
      isActive: true,
      type: "forex",
    },
    {
      name: "New Zealand Dollar / US Dollar",
      symbol: "NZDUSD",
      isActive: true,
      type: "forex",
    },
    {
      name: "Euro / Japanese Yen",
      symbol: "EURJPY",
      isActive: true,
      type: "forex",
    },
    {
      name: "British Pound / Japanese Yen",
      symbol: "GBPJPY",
      isActive: true,
      type: "forex",
    },
    {
      name: "Euro / British Pound",
      symbol: "EURGBP",
      isActive: true,
      type: "forex",
    },

    /* -------- INDICES (CFD/spot-style symbols) -------- */
    {
      name: "S&P 500 Index",
      symbol: "US500",
      isActive: true,
      type: "indices",
    },
    {
      name: "NASDAQ 100 Index",
      symbol: "US100",
      isActive: true,
      type: "indices",
    },
    {
      name: "Dow Jones 30 Index",
      symbol: "US30",
      isActive: true,
      type: "indices",
    },
    {
      name: "Germany 40 (DAX)",
      symbol: "GER40",
      isActive: true,
      type: "indices",
    },
    {
      name: "FTSE 100",
      symbol: "UK100",
      isActive: true,
      type: "indices",
    },
    {
      name: "Nikkei 225",
      symbol: "JPN225",
      isActive: true,
      type: "indices",
    },
    {
      name: "Hang Seng Index",
      symbol: "HK50",
      isActive: true,
      type: "indices",
    },

    /* -------- CRYPTO -------- */
    {
      name: "Bitcoin / US Dollar",
      symbol: "BTCUSD",
      isActive: true,
      type: "crypto",
    },
    {
      name: "Ethereum / US Dollar",
      symbol: "ETHUSD",
      isActive: true,
      type: "crypto",
    },
    {
      name: "Solana / US Dollar",
      symbol: "SOLUSD",
      isActive: true,
      type: "crypto",
    },
    {
      name: "XRP / US Dollar",
      symbol: "XRPUSD",
      isActive: true,
      type: "crypto",
    },
    {
      name: "BNB / US Dollar",
      symbol: "BNBUSD",
      isActive: true,
      type: "crypto",
    },

    /* -------- FUTURES (заримыг indices-тэй давхар ангилсан) -------- */
    {
      name: "E-mini S&P 500 (CME)",
      symbol: "ES",
      isActive: true,
      type: "futures",
    },
    {
      name: "E-mini Nasdaq 100 (CME)",
      symbol: "NQ",
      isActive: true,
      type: "futures",
    },
    {
      name: "E-mini Dow (CBOT)",
      symbol: "YM",
      isActive: true,
      type: "futures",
    },
    {
      name: "E-mini Russell 2000 (CME)",
      symbol: "RTY",
      isActive: true,
      type: "futures",
    },
    {
      name: "Crude Oil WTI (NYMEX)",
      symbol: "CL",
      isActive: true,
      type: "futures",
    },
    {
      name: "Gold (COMEX)",
      symbol: "GC",
      isActive: true,
      type: "futures",
    },
    {
      name: "Silver (COMEX)",
      symbol: "SI",
      isActive: true,
      type: "futures",
    },
    {
      name: "Apple Inc.",
      symbol: "AAPL",
      isActive: true,
      type: "stocks",
    },
    {
      name: "Microsoft Corporation",
      symbol: "MSFT",
      isActive: true,
      type: "stocks",
    },
    {
      name: "Amazon.com, Inc.",
      symbol: "AMZN",
      isActive: true,
      type: "stocks",
    },
    {
      name: "Alphabet Inc. (Class A)",
      symbol: "GOOGL",
      isActive: true,
      type: "stocks",
    },
    {
      name: "Meta Platforms, Inc.",
      symbol: "META",
      isActive: true,
      type: "stocks",
    },
    {
      name: "Tesla, Inc.",
      symbol: "TSLA",
      isActive: true,
      type: "stocks",
    },

    {
      name: "NVIDIA Corporation",
      symbol: "NVDA",
      isActive: true,
      type: "stocks",
    },
    {
      name: "Broadcom Inc.",
      symbol: "AVGO",
      isActive: true,
      type: "stocks",
    },
    {
      name: "Advanced Micro Devices, Inc.",
      symbol: "AMD",
      isActive: true,
      type: "stocks",
    },
    {
      name: "Intel Corporation",
      symbol: "INTC",
      isActive: true,
      type: "stocks",
    },

    {
      name: "Netflix, Inc.",
      symbol: "NFLX",
      isActive: true,
      type: "stocks",
    },
    {
      name: "Walt Disney Company",
      symbol: "DIS",
      isActive: true,
      type: "stocks",
    },

    {
      name: "Visa Inc.",
      symbol: "V",
      isActive: true,
      type: "stocks",
    },
    {
      name: "Mastercard Incorporated",
      symbol: "MA",
      isActive: true,
      type: "stocks",
    },
    {
      name: "PayPal Holdings, Inc.",
      symbol: "PYPL",
      isActive: true,
      type: "stocks",
    },

    {
      name: "Berkshire Hathaway Inc. (B)",
      symbol: "BRK.B",
      isActive: true,
      type: "stocks",
    },
    {
      name: "JPMorgan Chase & Co.",
      symbol: "JPM",
      isActive: true,
      type: "stocks",
    },
    {
      name: "Bank of America Corporation",
      symbol: "BAC",
      isActive: true,
      type: "stocks",
    },

    {
      name: "UnitedHealth Group Incorporated",
      symbol: "UNH",
      isActive: true,
      type: "stocks",
    },
    {
      name: "Johnson & Johnson",
      symbol: "JNJ",
      isActive: true,
      type: "stocks",
    },
    {
      name: "Pfizer Inc.",
      symbol: "PFE",
      isActive: true,
      type: "stocks",
    },
    {
      name: "Merck & Co., Inc.",
      symbol: "MRK",
      isActive: true,
      type: "stocks",
    },

    {
      name: "Procter & Gamble Company",
      symbol: "PG",
      isActive: true,
      type: "stocks",
    },
    {
      name: "Coca-Cola Company",
      symbol: "KO",
      isActive: true,
      type: "stocks",
    },
    {
      name: "PepsiCo, Inc.",
      symbol: "PEP",
      isActive: true,
      type: "stocks",
    },
    {
      name: "McDonald's Corporation",
      symbol: "MCD",
      isActive: true,
      type: "stocks",
    },

    {
      name: "Costco Wholesale Corporation",
      symbol: "COST",
      isActive: true,
      type: "stocks",
    },
    {
      name: "Walmart Inc.",
      symbol: "WMT",
      isActive: true,
      type: "stocks",
    },
    {
      name: "Home Depot, Inc.",
      symbol: "HD",
      isActive: true,
      type: "stocks",
    },

    {
      name: "Exxon Mobil Corporation",
      symbol: "XOM",
      isActive: true,
      type: "stocks",
    },
    {
      name: "Chevron Corporation",
      symbol: "CVX",
      isActive: true,
      type: "stocks",
    },
  ];

  const { error: symbolsError } = await supabase
    .from("symbols")
    .insert(symbols);

  if (symbolsError) return { isOk: false, error: symbolsError.message };

  return {
    isOk: true,
  };
};
