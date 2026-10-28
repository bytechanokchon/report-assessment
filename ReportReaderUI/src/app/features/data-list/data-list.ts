import { ChangeDetectorRef, Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { ExcelTable } from '../../components/excel-table/excel-table';

@Component({
  imports: [ExcelTable],
  selector: 'app-data-list',
  styleUrl: './data-list.css',
  templateUrl: './data-list.html',
})
export class DataList {
  excelData: Record<string, unknown>[] = [];
  filterWord: string | null = null;

  constructor(private changeDetector: ChangeDetectorRef) {

  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }
    try {
      // อ่านไฟล์ Excel เป็น ArrayBuffer
      const buffer = await file.arrayBuffer();

      // อ่าน Workbook
      const workbook = XLSX.read(buffer, {
        type: 'array'
      });

      // เลือก Sheet แรก
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw new Error('ไม่พบ Sheet ในไฟล์ Excel');
      }

      const worksheet = workbook.Sheets[sheetName];

      // แปลงข้อมูลเป็น Array of Objects
      this.excelData = XLSX.utils.sheet_to_json<
        Record<string, unknown>
      >(worksheet, {
        defval: ''
      });

      this.changeDetector.detectChanges();
    } catch (error) {
      console.error('ไม่สามารถอ่านไฟล์ Excel ได้', error);
    }
  }

  onChangeFilterText(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value.length == 0) {
      this.filterWord = null;
    } else {
      this.filterWord = value;
    }

    this.changeDetector.detectChanges();
  }
}
