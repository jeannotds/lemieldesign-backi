// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { UsersModule } from './users/users.module';
// import { MongooseModule } from '@nestjs/mongoose';

// @Module({
//   imports: [UsersModule, 
//     MongooseModule.forRoot('mongodb+srv://laetitia:lemieldesign@cluster0.rtltvsv.mongodb.net/lemieldesign?retryWrites=true&w=majority&appName=Cluster0'),
//   ],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}


import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: 'mongodb+srv://laetitia:lemieldesign@cluster0.rtltvsv.mongodb.net/lemieldesign',
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
// ?retryWrites=true&w=majority&appName=Cluster0