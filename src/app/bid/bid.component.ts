import { Component, OnInit, ViewChild } from '@angular/core';
import { ServerConfig } from 'app/provider/server.config';
import { Router } from '@angular/router';
import { PubSubService } from 'angular2-pubsub';
import { BidService } from 'app/bid/bid.service';
declare let $: any;

@Component({
  selector: 'app-bid',
  templateUrl: './bid.component.html',
  styleUrls: ['./bid.component.scss']
})
export class BidComponent implements OnInit {
  @ViewChild('modalbid') modalbid;
  @ViewChild('prdimgInput') prdimgInput;
  private ACTION_BID: string;
  private addImgPrd: Array<any> = [];
  private isEditImage: boolean = false;
  private bidData: any = {};
  private bidlist: Array<any> = [];
  constructor(private server: ServerConfig, private router: Router, private pubsub: PubSubService, private bidService: BidService) { }

  ngOnInit() {
    this.server.isLogin().subscribe(data => {
      if (!data) {
        this.router.navigate(['/login']);
      } else {
        this.pubsub.$pub('loading', true);
        this.InitialData();
      }
    });
  }
  InitialData() {
    this.bidService.getBid().subscribe((data) => {
      this.bidlist = data;
      this.pubsub.$pub('loading', false);
    })
  }

  addBid() {
    this.ACTION_BID = 'เพิ่ม';
    $(this.modalbid.nativeElement).modal('show');
  }
  cancelAddBid() {
    $(this.modalbid.nativeElement).modal('hide');
    this.addImgPrd = [];
    this.bidData = {};
  }

  upImgPrd() {
    this.prdimgInput.nativeElement.click();
  }
  removeprdImg(index) {
    this.addImgPrd.splice(index, 1);
    if (this.addImgPrd.length == 0) {
      this.isEditImage = false;
    }
  }


  onupImgPrdChange($event) {
    const fileBrowser = this.prdimgInput.nativeElement;
    const reader = new FileReader();
    reader.readAsDataURL(fileBrowser.files[0]);
    if (fileBrowser.files.length > 0) {
      reader.onload = () => {
        this.isEditImage = true;
        this.addImgPrd.push(reader.result.replace(/\n/g, ''));
      };
    }
  }
  saveBid() {
    this.pubsub.$pub('loading', true);
    let sendBid: any = {};
    let img: Array<any> = [];
    if (this.ACTION_BID == 'เพิ่ม') {
      if (this.isEditImage == true) {
        this.addImgPrd.forEach((el, i) => {
          this.bidService.uploadImage(el).subscribe((upImg) => {
            img.push(upImg.imageURL);
            if (i == this.addImgPrd.length) {
              sendBid.image = img;
            }
            sendBid.name = this.bidData.name;
            sendBid.startprice = this.bidData.startprice;
            sendBid.bidprice = this.bidData.bidprice;
            sendBid.detail = this.bidData.detail;
            sendBid.starttime = this.bidData.starttime;
            sendBid.endtime = this.bidData.endtime;
            console.log(sendBid);
            this.bidService.saveBid(sendBid).subscribe((data) => {
              alert("เพิ่มการประมูลสินค้าเรียบร้อย");
              this.InitialData();
              $(this.modalbid.nativeElement).modal('hide');
            }, (err) => {
              alert("ไม่สามารถเพิ่มการประมูลสินค้าได้");
              console.log(err);
              this.pubsub.$pub('loading', false);
            });
            // }
          });
        });


      } else {
        alert("กรุณาเพิ่มรูปภาพการประมูล");
        this.pubsub.$pub('loading', false);
      }
    } else if (this.ACTION_BID == 'แก้ไข') {
      if (this.isEditImage == true) {

      } else {

      }
    }
  }
}
