import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CollectionsController } from './collections/collections.controller';
import { CollectionsModule } from './collections/collections.module';
import { CaracteristicsModule } from './caracteristics/caracteristics.module';
import { ProductsModule } from './products/products.module';
import { SendmailsModule } from './sendmails/sendmails.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // permet d'accéder partout sans réimporter
    }),
    UsersModule,
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_URI,
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('✅ Connexion à MongoDB réussie');
          });
          connection.on('error', (err) => {
            console.error('❌ Erreur de connexion à MongoDB :', err);
          });
          return connection;
        },
      }),
    }),
    AuthModule,
    CollectionsModule,
    CaracteristicsModule,
    ProductsModule,
    SendmailsModule,
    
    // ✅ Cache Redis
    CacheModule.registerAsync({
      isGlobal: true,

      useFactory: async () => ({
        store: await redisStore({
          socket: {
            // host: 'redis',
            url: process.env.REDIS_URL,
            // port: 6379,
          },
        }),
        ttl: Number(process.env.PRODUCTS_CACHE_TTL || 60),
      }),
    }),
  ],
  controllers: [AppController, CollectionsController],
  providers: [AppService],
})
export class AppModule {}
// ?retryWrites=true&w=majority&appName=Cluster0