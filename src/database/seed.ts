import AppDataSource from './data-source.js';
import { Brand } from '../brands/entities/brand.entity.js';
import { Tire } from '../tires/entities/tire.entity.js';
import { TireSeason } from '../tires/enums/tire-season.enum.js';
import { Inventory } from '../inventory/entities/inventory.entity.js';

const brandsData = [
  { name: 'Firemax', country: 'China' },
  { name: 'Cordiant', country: 'Russia' },
  { name: 'Wanli', country: 'China' },
  { name: 'Sailun', country: 'China' },
];

const tiresData = [
  { brandName: 'Firemax', model: 'FM806', season: TireSeason.WINTER, width: 225, profile: 60, radius: 18, loadIndex: 104, speedRating: 'H', extraLoad: false, originPrice: '28000.00', unitPrice: '31000.00', quantity: 0 },
  { brandName: 'Cordiant', model: 'Winter Drive', season: TireSeason.WINTER, width: 195, profile: 65, radius: 15, loadIndex: 91, speedRating: 'T', extraLoad: false, originPrice: '13500.00', unitPrice: '15500.00', quantity: 8 },
  { brandName: 'Wanli', model: 'SW312', season: TireSeason.WINTER, width: 195, profile: 65, radius: 15, loadIndex: 91, speedRating: 'T', extraLoad: false, originPrice: '14500.00', unitPrice: '16500.00', quantity: 8 },
  { brandName: 'Sailun', model: 'Ice Blazer Arctic', season: TireSeason.WINTER, width: 195, profile: 65, radius: 15, loadIndex: 91, speedRating: 'T', extraLoad: false, originPrice: '15500.00', unitPrice: '18500.00', quantity: 8 },
  { brandName: 'Wanli', model: 'SW312', season: TireSeason.WINTER, width: 205, profile: 55, radius: 16, loadIndex: 91, speedRating: 'T', extraLoad: false, originPrice: '15500.00', unitPrice: '17500.00', quantity: 8 },
  { brandName: 'Wanli', model: 'SW312', season: TireSeason.WINTER, width: 215, profile: 55, radius: 17, loadIndex: 94, speedRating: 'S', extraLoad: false, originPrice: '20500.00', unitPrice: '23000.00', quantity: 4 },
  { brandName: 'Cordiant', model: 'Winter Drive', season: TireSeason.WINTER, width: 215, profile: 55, radius: 17, loadIndex: 98, speedRating: 'T', extraLoad: false, originPrice: '18500.00', unitPrice: '21000.00', quantity: 0 },
  { brandName: 'Wanli', model: 'SW312', season: TireSeason.WINTER, width: 225, profile: 45, radius: 17, loadIndex: 91, speedRating: 'T', extraLoad: false, originPrice: '19000.00', unitPrice: '21500.00', quantity: 4 },
  { brandName: 'Wanli', model: 'SW312', season: TireSeason.WINTER, width: 235, profile: 45, radius: 18, loadIndex: 94, speedRating: 'T', extraLoad: false, originPrice: '22500.00', unitPrice: '25500.00', quantity: 4 },
  { brandName: 'Sailun', model: 'Ice Blazer Arctic', season: TireSeason.WINTER, width: 215, profile: 50, radius: 17, loadIndex: 91, speedRating: 'T', extraLoad: false, originPrice: '20500.00', unitPrice: '25000.00', quantity: 4 },
  { brandName: 'Wanli', model: 'SW312', season: TireSeason.WINTER, width: 235, profile: 50, radius: 17, loadIndex: 100, speedRating: 'S', extraLoad: true, originPrice: '22000.00', unitPrice: '24000.00', quantity: 4 },
  { brandName: 'Cordiant', model: 'Winter Drive', season: TireSeason.WINTER, width: 175, profile: 70, radius: 13, loadIndex: 91, speedRating: 'T', extraLoad: false, originPrice: '10000.00', unitPrice: '11500.00', quantity: 6 },
];

async function seed() {
  // Open the Postgres connection defined in data-source.ts.
  await AppDataSource.initialize();

  // Repositories are how TypeORM reads/writes each table.
  const brandRepo = AppDataSource.getRepository(Brand);
  const tireRepo = AppDataSource.getRepository(Tire);
  const inventoryRepo = AppDataSource.getRepository(Inventory);

  // Step 1: create any brands that don't exist yet, and remember their
  // saved rows (with real ids) so tires can be linked to them below.
  const brandByName = new Map<string, Brand>();
  for (const data of brandsData) {
    let brand = await brandRepo.findOneBy({ name: data.name });
    if (!brand) {
      brand = await brandRepo.save(brandRepo.create(data));
      console.log(`Created brand: ${brand.name}`);
    }
    brandByName.set(data.name, brand);
  }

  // Step 2: for each tire, create the tire row (if missing) linked to its
  // brand, then create its matching inventory row (if missing).
  for (const { brandName, originPrice, unitPrice, quantity, ...tireData } of tiresData) {
    const brand = brandByName.get(brandName)!;

    // A tire is uniquely identified by model + size (width/profile/radius),
    // so use that combo to check if it was already seeded.
    let tire = await tireRepo.findOne({
      where: { model: tireData.model, width: tireData.width, profile: tireData.profile, radius: tireData.radius },
    });
    if (!tire) {
      tire = await tireRepo.save(tireRepo.create({ ...tireData, brand }));
      console.log(`Created tire: ${brand.name} ${tire.model} (${tire.width}/${tire.profile}R${tire.radius})`);
    }

    // Inventory is a separate table (price/stock), one row per tire.
    const existingInventory = await inventoryRepo.findOne({ where: { tire: { id: tire.id } } });
    if (!existingInventory) {
      await inventoryRepo.save(inventoryRepo.create({ tire, originPrice, unitPrice, quantity }));
      console.log(`Created inventory for: ${brand.name} ${tire.model} (qty ${quantity})`);
    }
  }

  await AppDataSource.destroy();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
