import { SocialPlatform, PlatformContentData } from '@/lib/types/database';

export interface DuplicateCheckWarning {
  platformA: SocialPlatform;
  platformB: SocialPlatform;
  similarityPercentage: number;
  message: {
    en: string;
    ur: string;
  };
}

export function detectDuplicateContent(
  contents: Record<SocialPlatform, PlatformContentData>
): DuplicateCheckWarning[] {
  const warnings: DuplicateCheckWarning[] = [];
  const platforms = Object.keys(contents) as SocialPlatform[];

  for (let i = 0; i < platforms.length; i++) {
    for (let j = i + 1; j < platforms.length; j++) {
      const pA = platforms[i];
      const pB = platforms[j];
      const textA = contents[pA]?.caption || '';
      const textB = contents[pB]?.caption || '';

      if (textA.length > 50 && textB.length > 50) {
        const similarity = computeJaccardSimilarity(textA, textB);
        if (similarity >= 0.75) {
          const pct = Math.round(similarity * 100);
          warnings.push({
            platformA: pA,
            platformB: pB,
            similarityPercentage: pct,
            message: {
              en: `${pA.toUpperCase()} and ${pB.toUpperCase()} captions are ${pct}% identical. Consider revising to fit each platform's distinct audience.`,
              ur: `${pA.toUpperCase()} اور ${pB.toUpperCase()} کے کیپشنز میں ${pct}% مماثلت ہے۔ ہر پلیٹ فارم کے مزاج کے مطابق مختلف انداز اپنائیں۔`,
            },
          });
        }
      }
    }
  }

  return warnings;
}

function computeJaccardSimilarity(strA: string, strB: string): number {
  const tokenize = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_\`~()؟،]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 1)
    );

  const setA = tokenize(strA);
  const setB = tokenize(strB);

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionCount = 0;
  setA.forEach((word) => {
    if (setB.has(word)) intersectionCount++;
  });

  const unionCount = new Set([...setA, ...setB]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}
