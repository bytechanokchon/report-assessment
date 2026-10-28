import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { ExcelDataDto } from '../../dtos/excel.dto';
import * as XLSX from 'xlsx';
import { ShipmentDashboard } from '../shipment-dashboard/shipment-dashboard';


@Component({
  selector: 'app-excel-table',
  templateUrl: './excel-table.html',
  styleUrl: './excel-table.css',
  imports: [ShipmentDashboard],
})
export class ExcelTable implements OnChanges {
  @Input() datas: Record<string, unknown>[] = [];
  @Input() filterWord: string | null = null;

  rows: ExcelDataDto[] = [];
  rowDisplaies: ExcelDataDto[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    // แปลงข้อมูลใหม่เมื่อ datas เปลี่ยน
    if (changes['datas']) {
      this.mapRows();
    }

    // กรองข้อมูลใหม่เมื่อ datas หรือ filterWord เปลี่ยน
    if (changes['datas'] || changes['filterWord']) {
      this.filterRows();
      
    console.log(this.rowDisplaies)
    }
  }

  private mapRows(): void {
    this.rows = this.datas.map((row) => ({
      jobI: row['Job I'],
      eta: row['ETA'],
      ata: row['ATA'],
      invoiceNo: row['Invoice No'],
      originPortName: row['Origin(Port Name)'],
      releasePort: row['Release Port'],
      carrierName: row['Carrier Name'],
      ctnrNo: row['CTNR NO.'],
      ctnrNoCount: row['CTNR NO. Count'],
      seal: row['Seal'],
      containerSize: row['Container Size'],
      cartons: row['Cartons'],
      cbm: row['CBM'],
      fileNameDate: row['FileNameDate'],
      doRelease: row['DO Release'],
      shippingDocumentReceive:
        row['Shipping Document receive (วันที่ได้เอกสารในการทำใบขน)'],
      shippingDocumentIssue:
        row['Shipping Document issue reason (ข้อมูลผิดรอแก้ไข)'],
      shippingDocumentComplete:
        row['Shipping Document Complete (วันที่ได้เอกสารพร้อมทำใบขน)'],
      statusDeclaration: row['Status Declaration'],
      customsReleaseImport:
        row['Customs Relese Import (Declaration complete) (0209)'],
      deliveryPlane: row['Delivery Plan'],
      importDeclerationRelease:
        row['Import Decleration Relese (0309)'],
      deliveryDateCustom: row['Delivery Date (Customs)'],
      DeliceryPlace: row['Delivery Place'],
    }));
  }

  private filterRows(): void {
    const keyword = this.filterWord?.trim().toLowerCase() ?? '';

    if (!keyword) {
      this.rowDisplaies = [...this.rows];
      return;
    }

    this.rowDisplaies = this.rows.filter((row) =>
      Object.values(row).some(
        (value) =>
          value != null &&
          String(value).toLowerCase().includes(keyword)
      )
    );
  }

  exportToExcel(): void {
    // ตรวจสอบว่ามีข้อมูลที่ผ่านการกรองหรือไม่
    if (this.rowDisplaies.length === 0) {
      alert('ไม่มีข้อมูลสำหรับ Export');
      return;
    }

    // แปลงข้อมูลพร้อมกำหนดชื่อหัวตาราง
    const exportData = this.rowDisplaies.map((row) => ({
      'Job I': row.jobI,
      'ETA': row.eta,
      'ATA': row.ata,
      'Invoice No.': row.invoiceNo,
      'Origin Port': row.originPortName,
      'Release Port': row.releasePort,
      'Carrier Name': row.carrierName,
      'Container No.': row.ctnrNo,
      'Container Count': row.ctnrNoCount,
      'Seal': row.seal,
      'Container Size': row.containerSize,
      'Cartons': row.cartons,
      'CBM': row.cbm,
      'File Name Date': row.fileNameDate,
      'DO Release': row.doRelease,
      'Shipping Document Receive': row.shippingDocumentReceive,
      'Shipping Document Issue': row.shippingDocumentIssue,
      'Shipping Document Complete': row.shippingDocumentComplete,
      'Status Declaration': row.statusDeclaration,
      'Customs Release Import': row.customsReleaseImport,
      'Delivery Plan': row.deliveryPlane,
      'Import Declaration Release': row.importDeclerationRelease,
      'Delivery Date Custom': row.deliveryDateCustom,
      'Delivery Place': row.DeliceryPlace,
    }));

    // สร้าง Worksheet จากข้อมูลที่กรองแล้ว
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // สร้าง Workbook และเพิ่ม Worksheet
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Import Shipment'
    );

    // ดาวน์โหลดไฟล์ Excel
    XLSX.writeFile(
      workbook,
      'Filtered_Import_Shipment_Data.xlsx'
    );
  }
}