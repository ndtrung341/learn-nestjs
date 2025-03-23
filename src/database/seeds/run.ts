import { AppDataSource } from '@db/data-source';
import { UserSeeder } from './user.seeder';

const runSeed = async () => {
   const dataSource = await AppDataSource.initialize();
   console.log('🚀 Starting seed...');

   try {
      await UserSeeder.run(dataSource);
      console.log('✅ Seeding completed!');
   } catch (error) {
      console.error('❌ Seeding failed:', error);
   } finally {
      await dataSource.destroy();
   }
};

runSeed();
