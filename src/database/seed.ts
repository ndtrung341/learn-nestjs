import { AppDataSource } from './data-source';
import { UserSeeder } from './seeds/user.seeder';

const centerText = (text: string, width = 50): string => {
   const padLeft = Math.floor((width - text.length) / 2);
   const padRight = width - text.length - padLeft;
   return ' '.repeat(padLeft) + text + ' '.repeat(padRight);
};

const runSeed = async () => {
   console.log('\n' + '='.repeat(50));
   process.stdout.write(
      centerText('🚀 STARTING DATABASE SEEDING...', 50) + '\n',
   );
   console.log('='.repeat(50) + '\n');

   const dataSource = await AppDataSource.initialize();
   const startTime = Date.now();
   const seeders = [UserSeeder];

   try {
      for (const Seeder of seeders) {
         console.log('-'.repeat(50));
         process.stdout.write(`🌱 Running ${Seeder.name}...\n`);

         const seederStartTime = Date.now();
         await new Seeder(dataSource).run();
         const seederEndTime = Date.now();

         process.stdout.write(
            `✅ Completed in ${(seederEndTime - seederStartTime) / 1000}s\n`,
         );
         console.log('-'.repeat(50) + '\n');
      }

      const endTime = Date.now();
      console.log('='.repeat(50));
      process.stdout.write(
         centerText(
            `🎉 ALL SEEDERS COMPLETED IN ${(endTime - startTime) / 1000}s`,
            50,
         ) + '\n',
      );
   } catch (error) {
      console.log('='.repeat(50));
      console.error('❌ SEEDING FAILED!');
      console.error(error);
   } finally {
      await dataSource.destroy();
      console.log('='.repeat(50) + '\n');
   }
};

runSeed();
