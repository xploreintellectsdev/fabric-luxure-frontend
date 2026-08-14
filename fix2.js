const fs = require('fs');
const files = [
  'C:/vlglobal backup/client/pages/home/ExclusiveSummerLinens.tsx',
  'C:/vlglobal backup/client/pages/home/ShopbyTexturePatterns.tsx',
  'C:/vlglobal backup/client/pages/productDetail/ProductViewHero.tsx',
  'C:/vlglobal backup/client/pages/shop/products.tsx',
  'C:/vlglobal backup/client/components/OurPicks.tsx',
  'C:/vlglobal backup/client/components/QuickAddModal.tsx'
];

for(const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/pro_type_name: (\w+)\.product_type_name,\s*stitching_percentage: (\w+)\.stitching_percentage/g, (match, v1, v2, offset, fullText) => {
    const before = fullText.substring(Math.max(0, offset - 150), offset);
    const m = before.match(/price:\s*(\w+)\.price/);
    const varName = m ? m[1] : 'item';
    return `pro_type_name: ${varName}.product_type_name,\n      stitching_percentage: ${varName}.stitching_percentage`;
  });

  fs.writeFileSync(file, content);
}
console.log('Fixed exactly');
