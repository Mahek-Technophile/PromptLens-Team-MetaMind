const CO2_PER_1K_TOKENS = 0.001;
const WATER_PER_1K_TOKENS = 0.5;

function getWaterLabel(ml) {
  if (ml >= 250 && ml <= 1000) {
    return `≈ ${(ml / 250).toFixed(1)} sips`;
  }
  if (ml >= 1000) {
    return `≈ ${(ml / 1000).toFixed(1)} L`;
  }
  return `${ml.toFixed(1)} ml`;
}

export function calcImpact(originalTokens, optimizedTokens) {
  const tokensSaved = originalTokens - optimizedTokens;
  const percentSaved = (tokensSaved / originalTokens) * 100;
  const co2Grams = (tokensSaved / 1000) * CO2_PER_1K_TOKENS;
  const waterMl = (tokensSaved / 1000) * WATER_PER_1K_TOKENS;
  const waterLabel = getWaterLabel(waterMl);

  return {
    tokensSaved,
    percentSaved,
    co2Grams,
    waterMl,
    waterLabel,
  };
}
