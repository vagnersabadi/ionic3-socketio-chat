import { Component, ViewChild } from '@angular/core';
import { IonicPage, ToastController, AlertController, Content } from 'ionic-angular';
import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';
import { FormControl, FormBuilder } from '@angular/forms';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  @ViewChild(Content) content: Content;
  messages = [];
  nickname = '';

  messageForm: any;
  chatBox: any;

  constructor(
    private socket: Socket,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private formBuilder: FormBuilder
  ) {
    this.init()
  }

  
  ionViewWillLeave(): void {
    this.socket.disconnect();
  }

  private init() {

    this.messageForm = this.formBuilder.group({
      message: new FormControl('')
    });
    this.chatBox = '';

    this.presentPrompt().then((nickname: string) => {
      this.nickname = nickname;

      this.socket.connect();
      this.socket.emit('set-nickname', this.nickname);

      this.getMessages().subscribe(message => {
        this.messages.push(message);
        this.scrollToBottom();
      });

      this.getUsers().subscribe(data => {
        let user = data['user'];
        if (data['event'] === 'left') {
          this.showToast('User left: ' + user);
        } else {
          this.showToast('User joined: ' + user);
        }
      });
    });
  }

  private sendMessage(message: string): void {
    if (!message || message === '') return;

    this.socket.emit('add-message', { text: message });
    this.chatBox = '';
  }

  private getMessages(): Observable<{}> {
    let observable = new Observable(observer => {
      this.socket.on('message', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  private getUsers(): Observable<{}> {
    let observable = new Observable(observer => {
      this.socket.on('users-changed', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  private showToast(msg: string): void {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  private presentPrompt(): Promise<string> {
    return new Promise((resolve, reject) => {
      let alert = this.alertCtrl.create({
        title: 'Seu nome',
        inputs: [
          {
            name: 'nickname',
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: data => {
              resolve('random_' + Math.round(Math.random() * 100));
            }
          },
          {
            text: 'Ok',
            handler: data => {
              resolve(data.nickname);
            }
          }
        ]
      });
      alert.present();
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      this.content.scrollToBottom();
    }, 100);
  }

}
