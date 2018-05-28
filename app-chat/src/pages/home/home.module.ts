import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomePage } from './home';
import { SocketIoModule } from 'ng-socket-io';
import { configSocketIO } from './../../app/config';

@NgModule({
  declarations: [
    HomePage,
  ],
  imports: [
    IonicPageModule.forChild(HomePage),
    SocketIoModule.forRoot(configSocketIO)

  ],
})
export class HomePageModule {}
