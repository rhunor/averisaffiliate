/* =============================================
   AVERIS ACADEMY FOREX CALCULATOR — script.js
   ============================================= */

/*
  ══════════════════════════════════════════════════════════════════
  PIP SIZE REFERENCE
  ──────────────────────────────────────────────────────────────────
  GOLD:           1 pip = $1/lot   → pipMultiplier = 1
  USD PAIRS:      1 pip = 0.0001   → pipMultiplier = 10  (per micro lot convention)
  JPY PAIRS:      1 pip = 0.01     → pipsPerPriceUnit = 100, pricePipMultiplier = 10
  BTC:            1 pip = $1       → pipMultiplier = 1
  ETH:            1 pip = $0.1     → pipMultiplier = 0.1
  NAS100/US30/GER40/OIL: lot-specific multipliers

  CROSS PAIRS (EUR/GBP, GBP/AUD, etc.):
    - pip size = 0.0001 (same as USD pairs)
    - pip value in USD requires live FX conversion of quote currency → USD
    - Formula: lotSize = riskUSD / (slPips × pipValueUSD)
    - pipValueUSD = 10 × quoteToUSD   (standard lot = 100,000 units; 1 pip on std lot = 10 quote units)
  ══════════════════════════════════════════════════════════════════
*/

// ── Live Rate Cache ───────────────────────────────────────────────────────────
let liveRates = {} // { EUR: 0.93, GBP: 0.79, ... }  (USD as base)
let ratesLoaded = false
let ratesFailed = false

async function fetchLiveRates() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD')
    const data = await res.json()
    if (data && data.rates) {
      liveRates = data.rates // rates[CCY] = units of CCY per 1 USD
      ratesLoaded = true
      updateRateBadge(true)
    } else {
      throw new Error('Bad response')
    }
  } catch {
    ratesFailed = true
    updateRateBadge(false)
  }
}

function updateRateBadge(success) {
  const badge = document.getElementById('rateBadge')
  if (!badge) return
  if (success) {
    badge.textContent = '● Live rates loaded'
    badge.className = 'rate-badge rate-ok'
  } else {
    badge.textContent =
      '● Live rates unavailable — cross-pair USD conversion approximate'
    badge.className = 'rate-badge rate-warn'
  }
  badge.style.display = 'block'
}

/** Returns how many USD 1 unit of `currency` is worth.
 *  e.g. getUSDRate('EUR') → ~1.08  (1 EUR = 1.08 USD)
 *  liveRates stores: rates[CCY] = CCY per 1 USD
 *  so: 1 CCY = 1 / rates[CCY] USD
 */
function getUSDRate(currency) {
  if (ratesLoaded && liveRates[currency]) {
    return 1 / liveRates[currency]
  }
  // Fallback approximate rates if API failed
  const fallback = {
    EUR: 1.08,
    GBP: 1.26,
    AUD: 0.65,
    CAD: 0.74,
    CHF: 1.1,
    NZD: 0.6,
    JPY: 0.0067,
  }
  return fallback[currency] || 1
}

// ══════════════════════════════════════════════════════════════════════════════
//  INSTRUMENT CONFIG
// ══════════════════════════════════════════════════════════════════════════════
/*
  For cross pairs we store:
    - quoteCurrency : the quote ccy whose pip value we convert to USD at runtime
    - pipSize       : 0.0001 (standard) or 0.01 (JPY)
    - isCross       : true  → use cross-pair lot size formula

  For legacy pairs we keep original keys intact.
*/

const INSTRUMENT_CONFIG = {
  // ── Original pairs ────────────────────────────────────────────────────────
  GOLD: {
    name: 'GOLD',
    pipMultiplier: 1,
    pipsPerPriceUnit: 100,
    pricePipMultiplier: 1,
  },
  CURRENCY_USD: {
    name: 'USD PAIR',
    pipMultiplier: 10,
    pipsPerPriceUnit: 10000,
    pricePipMultiplier: 10,
  },
  CURRENCY_JPY: {
    name: 'JPY PAIR',
    isCross: true,
    quoteCurrency: 'JPY',
    pipSize: 0.01,
  },
  BTC: {
    name: 'BITCOIN',
    pipMultiplier: 1,
    pipsPerPriceUnit: 1,
    pricePipMultiplier: 1,
  },
  ETH: {
    name: 'ETHEREUM',
    pipMultiplier: 0.1,
    pipsPerPriceUnit: 1,
    pricePipMultiplier: 0.1,
  },
  NAS100: {
    name: 'NASDAQ 100',
    pipMultiplier: 1,
    pipsPerPriceUnit: 1,
    pricePipMultiplier: 1,
  },
  US30: {
    name: 'US30',
    pipMultiplier: 10,
    pipsPerPriceUnit: 1,
    pricePipMultiplier: 10,
  },
  GER40: {
    name: 'GER40',
    pipMultiplier: 10,
    pipsPerPriceUnit: 1,
    pricePipMultiplier: 10,
  },
  OIL: {
    name: 'OIL',
    pipMultiplier: 10,
    pipsPerPriceUnit: 1,
    pricePipMultiplier: 10,
  },

  // ── USD base pairs (quote ≠ USD) — pip = 0.0001 ──────────────────────────
  USD_CHF: {
    name: 'USD/CHF',
    isCross: true,
    quoteCurrency: 'CHF',
    pipSize: 0.0001,
  },
  USD_CAD: {
    name: 'USD/CAD',
    isCross: true,
    quoteCurrency: 'CAD',
    pipSize: 0.0001,
  },

  // ── EUR cross pairs — pip = 0.0001 ────────────────────────────────────────
  EUR_GBP: {
    name: 'EUR/GBP',
    isCross: true,
    quoteCurrency: 'GBP',
    pipSize: 0.0001,
  },
  EUR_AUD: {
    name: 'EUR/AUD',
    isCross: true,
    quoteCurrency: 'AUD',
    pipSize: 0.0001,
  },
  EUR_CAD: {
    name: 'EUR/CAD',
    isCross: true,
    quoteCurrency: 'CAD',
    pipSize: 0.0001,
  },
  EUR_CHF: {
    name: 'EUR/CHF',
    isCross: true,
    quoteCurrency: 'CHF',
    pipSize: 0.0001,
  },
  EUR_NZD: {
    name: 'EUR/NZD',
    isCross: true,
    quoteCurrency: 'NZD',
    pipSize: 0.0001,
  },

  // ── GBP cross pairs — pip = 0.0001 ────────────────────────────────────────
  GBP_AUD: {
    name: 'GBP/AUD',
    isCross: true,
    quoteCurrency: 'AUD',
    pipSize: 0.0001,
  },
  GBP_CAD: {
    name: 'GBP/CAD',
    isCross: true,
    quoteCurrency: 'CAD',
    pipSize: 0.0001,
  },
  GBP_CHF: {
    name: 'GBP/CHF',
    isCross: true,
    quoteCurrency: 'CHF',
    pipSize: 0.0001,
  },
  GBP_NZD: {
    name: 'GBP/NZD',
    isCross: true,
    quoteCurrency: 'NZD',
    pipSize: 0.0001,
  },

  // ── AUD / NZD / CAD cross pairs — pip = 0.0001 ───────────────────────────
  AUD_CAD: {
    name: 'AUD/CAD',
    isCross: true,
    quoteCurrency: 'CAD',
    pipSize: 0.0001,
  },
  AUD_CHF: {
    name: 'AUD/CHF',
    isCross: true,
    quoteCurrency: 'CHF',
    pipSize: 0.0001,
  },
  AUD_NZD: {
    name: 'AUD/NZD',
    isCross: true,
    quoteCurrency: 'NZD',
    pipSize: 0.0001,
  },
  NZD_CAD: {
    name: 'NZD/CAD',
    isCross: true,
    quoteCurrency: 'CAD',
    pipSize: 0.0001,
  },
  NZD_CHF: {
    name: 'NZD/CHF',
    isCross: true,
    quoteCurrency: 'CHF',
    pipSize: 0.0001,
  },
  CAD_CHF: {
    name: 'CAD/CHF',
    isCross: true,
    quoteCurrency: 'CHF',
    pipSize: 0.0001,
  },
}

// ── State ─────────────────────────────────────────────────────────────────────
let isPriceMode = false
let isFixedAmount = false

// ── DOM References ────────────────────────────────────────────────────────────
const form = document.getElementById('forexForm')
const riskTypeDisplay = document.getElementById('riskTypeDisplay')
const riskValueInput = document.getElementById('riskValue')
const accountSizeInput = document.getElementById('accountSize')
const resultContainer = document.getElementById('resultContainer')
const tradingPairSelect = document.getElementById('tradingPair')
const instrumentBadge = document.getElementById('instrumentBadge')

const modeSwitchTrack = document.getElementById('modeSwitchTrack')
const modeLabelPips = document.getElementById('modeLabelPips')
const modeLabelPrice = document.getElementById('modeLabelPrice')
const modeDescription = document.getElementById('modeDescription')

const riskSwitchTrack = document.getElementById('riskSwitchTrack')
const riskLabelPct = document.getElementById('riskLabelPct')
const riskLabelFixed = document.getElementById('riskLabelFixed')

const pipsModeFields = document.getElementById('pipsModeFields')
const priceModeFields = document.getElementById('priceModeFields')
const priceResultRows = document.getElementById('priceResultRows')

const slPipsInput = document.getElementById('slPips')
const entryPriceInput = document.getElementById('entryPrice')
const stopLossPriceInput = document.getElementById('stopLossPrice')

// ── Pips / Price Mode Switch ──────────────────────────────────────────────────
function setMode(priceMode) {
  isPriceMode = priceMode
  hideResult()
  if (isPriceMode) {
    modeSwitchTrack.classList.add('price-active')
    modeLabelPrice.classList.add('active')
    modeLabelPips.classList.remove('active')
    modeDescription.textContent = 'Enter entry & stop loss prices'
    pipsModeFields.classList.add('hidden')
    priceModeFields.classList.remove('hidden')
    slPipsInput.removeAttribute('required')
    entryPriceInput.setAttribute('required', 'required')
    stopLossPriceInput.setAttribute('required', 'required')
  } else {
    modeSwitchTrack.classList.remove('price-active')
    modeLabelPips.classList.add('active')
    modeLabelPrice.classList.remove('active')
    modeDescription.textContent = 'Enter stop loss in pips'
    priceModeFields.classList.add('hidden')
    pipsModeFields.classList.remove('hidden')
    entryPriceInput.removeAttribute('required')
    stopLossPriceInput.removeAttribute('required')
    slPipsInput.setAttribute('required', 'required')
  }
}

modeSwitchTrack.addEventListener('click', () => setMode(!isPriceMode))
modeLabelPips.addEventListener('click', () => setMode(false))
modeLabelPrice.addEventListener('click', () => setMode(true))
setMode(false)

// ── Risk Type Switch ──────────────────────────────────────────────────────────
function setRiskMode(fixedMode) {
  isFixedAmount = fixedMode
  hideResult()
  if (isFixedAmount) {
    riskSwitchTrack.classList.add('toggled')
    riskLabelFixed.classList.add('active')
    riskLabelPct.classList.remove('active')
    riskTypeDisplay.textContent = '$'
    riskValueInput.placeholder = 'Enter fixed dollar amount'
  } else {
    riskSwitchTrack.classList.remove('toggled')
    riskLabelPct.classList.add('active')
    riskLabelFixed.classList.remove('active')
    riskTypeDisplay.textContent = '%'
    riskValueInput.placeholder = 'Enter percentage (e.g., 2)'
  }
  riskValueInput.value = ''
}

riskSwitchTrack.addEventListener('click', () => setRiskMode(!isFixedAmount))
riskLabelPct.addEventListener('click', () => setRiskMode(false))
riskLabelFixed.addEventListener('click', () => setRiskMode(true))
setRiskMode(false)

// ── Helper ────────────────────────────────────────────────────────────────────
function hideResult() {
  resultContainer.classList.remove('show')
}

// ══════════════════════════════════════════════════════════════════════════════
//  CROSS PAIR LOT SIZE
// ══════════════════════════════════════════════════════════════════════════════
/*
  Standard lot = 100,000 units of base currency.
  For a cross pair (e.g. EUR/GBP):
    1 pip = 0.0001 price movement
    On 1 standard lot → pip value in GBP = 100,000 × 0.0001 = 10 GBP
    pip value in USD = 10 × (1 GBP in USD) = 10 × getUSDRate('GBP')

  lotSize = riskUSD / (slPips × pipValueUSD)

  NOTE: This gives STANDARD lots. Divide by 100 for micro, etc.
  The result matches the existing code's lot unit convention.
*/
// function calcCrossLotSize(config, riskUSD, slPips) {
//   const pipValueUSD = 10 * getUSDRate(config.quoteCurrency)
//   return riskUSD / (slPips * pipValueUSD)
// }
function calcCrossLotSize(config, riskUSD, slPips) {
  const lotSize = 100000

  const quoteUSD = getUSDRate(config.quoteCurrency)

  const pipValueUSD = lotSize * config.pipSize * quoteUSD

  return riskUSD / (slPips * pipValueUSD)
}

// ══════════════════════════════════════════════════════════════════════════════
//  FORM SUBMISSION
// ══════════════════════════════════════════════════════════════════════════════
form.addEventListener('submit', function (e) {
  e.preventDefault()

  const tradingPair = tradingPairSelect.value
  if (!tradingPair) {
    alert('Please select a trading instrument.')
    return
  }

  const config = INSTRUMENT_CONFIG[tradingPair]
  const accountSize = parseFloat(accountSizeInput.value)
  const riskValue = parseFloat(riskValueInput.value)

  const riskInDollars = isFixedAmount
    ? riskValue
    : (accountSize * riskValue) / 100

  if (isNaN(riskInDollars) || riskInDollars <= 0) {
    alert('Please enter a valid risk amount.')
    return
  }

  let slPips, priceDiff, lotSize

  // ── CROSS PAIR BRANCH ─────────────────────────────────────────────────────
  if (config.isCross) {
    if (isPriceMode) {
      const entry = parseFloat(entryPriceInput.value)
      const sl = parseFloat(stopLossPriceInput.value)
      if (isNaN(entry) || isNaN(sl) || entry === sl) {
        alert('Please enter valid and different entry and stop loss prices.')
        return
      }
      priceDiff = Math.abs(entry - sl)
      slPips = priceDiff / config.pipSize // e.g. diff 0.0050 → 50 pips
    } else {
      slPips = parseFloat(slPipsInput.value)
      priceDiff = null
      if (isNaN(slPips) || slPips <= 0) {
        alert('Please enter a valid stop loss in pips (greater than 0).')
        return
      }
    }
    lotSize = calcCrossLotSize(config, riskInDollars, slPips)

    // ── ORIGINAL PAIR BRANCH (unchanged logic) ────────────────────────────────
  } else if (isPriceMode) {
    const entry = parseFloat(entryPriceInput.value)
    const sl = parseFloat(stopLossPriceInput.value)
    if (isNaN(entry) || isNaN(sl) || entry === sl) {
      alert('Please enter valid and different entry and stop loss prices.')
      return
    }
    priceDiff = Math.abs(entry - sl)
    slPips = priceDiff * config.pipsPerPriceUnit
    lotSize = riskInDollars / (slPips * config.pricePipMultiplier)
  } else {
    slPips = parseFloat(slPipsInput.value)
    if (isNaN(slPips) || slPips <= 0) {
      alert('Please enter a valid stop loss in pips (greater than 0).')
      return
    }
    priceDiff = null
    lotSize = riskInDollars / (slPips * config.pipMultiplier)
  }

  // ── Display ───────────────────────────────────────────────────────────────
  instrumentBadge.textContent = config.name
  document.getElementById('riskAmountDisplay').textContent =
    '$' + riskInDollars.toFixed(2)
  document.getElementById('lotSize').textContent = lotSize.toFixed(2)

  if (isPriceMode && priceDiff !== null) {
    const diffDecimals = config.quoteCurrency === 'JPY' ? 3 : 5
    document.getElementById('priceDiff').textContent =
      priceDiff.toFixed(diffDecimals)
    document.getElementById('derivedPips').textContent = slPips.toFixed(2)
    priceResultRows.classList.remove('hidden')
  } else {
    priceResultRows.classList.add('hidden')
  }

  // Show live rate note for cross pairs
  const crossNote = document.getElementById('crossRateNote')
  if (crossNote) {
    if (config.isCross) {
      const rate = getUSDRate(config.quoteCurrency)
      crossNote.textContent = `Live rate used: 1 ${config.quoteCurrency} = ${rate.toFixed(5)} USD`
      crossNote.style.display = 'block'
    } else {
      crossNote.style.display = 'none'
    }
  }

  resultContainer.classList.add('show')
  resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
})

// Reset result on any input change
form.querySelectorAll('input, select').forEach((el) => {
  el.addEventListener('input', hideResult)
})

// ── Fetch rates on load ───────────────────────────────────────────────────────
fetchLiveRates()

/*
  ══════════════════════════════════════════════════════════════════
  HTML CHANGES REQUIRED
  ══════════════════════════════════════════════════════════════════
  1. Add these option groups inside <select id="tradingPair">:

      <optgroup label="USD Base (non-USD quote)">
        <option value="USD_CHF">USD/CHF</option>
        <option value="USD_CAD">USD/CAD</option>
      </optgroup>
      <optgroup label="EUR Cross Pairs">
        <option value="EUR_GBP">EUR/GBP</option>
        <option value="EUR_AUD">EUR/AUD</option>
        <option value="EUR_CAD">EUR/CAD</option>
        <option value="EUR_CHF">EUR/CHF</option>
        <option value="EUR_NZD">EUR/NZD</option>
      </optgroup>
      <optgroup label="GBP Cross Pairs">
        <option value="GBP_AUD">GBP/AUD</option>
        <option value="GBP_CAD">GBP/CAD</option>
        <option value="GBP_CHF">GBP/CHF</option>
        <option value="GBP_NZD">GBP/NZD</option>
      </optgroup>
      <optgroup label="AUD / NZD / CAD Cross Pairs">
        <option value="AUD_CAD">AUD/CAD</option>
        <option value="AUD_CHF">AUD/CHF</option>
        <option value="AUD_NZD">AUD/NZD</option>
        <option value="NZD_CAD">NZD/CAD</option>
        <option value="NZD_CHF">NZD/CHF</option>
        <option value="CAD_CHF">CAD/CHF</option>
      </optgroup>

  2. Add a live rate badge anywhere visible (e.g. top of form or near result):
      <div id="rateBadge" style="display:none"></div>

  3. Add cross rate note inside #resultContainer:
      <div id="crossRateNote" style="display:none; font-size:0.8em; opacity:0.7;"></div>

  4. CSS for badges (add to your stylesheet):
      .rate-badge { padding: 4px 10px; border-radius: 4px; font-size: 0.78em; margin-bottom: 8px; }
      .rate-ok   { background: #1a3a1a; color: #4caf50; border: 1px solid #4caf50; }
      .rate-warn { background: #3a2a1a; color: #ff9800; border: 1px solid #ff9800; }
  ══════════════════════════════════════════════════════════════════
*/
