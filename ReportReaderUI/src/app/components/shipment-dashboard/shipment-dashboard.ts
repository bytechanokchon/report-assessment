
import { Component, Input, OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import {
  ChartData,
  ChartOptions,
} from 'chart.js';

import { ExcelDataDto } from '../../dtos/excel.dto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shipment-dashboard',
  standalone: true,
  imports: [BaseChartDirective, CommonModule, BaseChartDirective],
  templateUrl: './shipment-dashboard.html',
})
export class ShipmentDashboard implements OnChanges {
  @Input() datas: ExcelDataDto[] = [];

  totalShipments = 0;
  totalCartons = 0;
  totalCbm = 0;

  carrierChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'จำนวน Shipment',
        data: [],
        backgroundColor: '#3B82F6',
        borderRadius: 6,
      },
    ],
  };

  containerChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#8B5CF6',
          '#F43F5E',
          '#06B6D4',
        ],
      },
    ],
  };

  originChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'จำนวน Cartons',
        data: [],
        backgroundColor: '#10B981',
        borderRadius: 6,
      },
    ],
  };

  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  ngOnChanges(): void {
    this.buildDashboard();
  }

  private buildDashboard(): void {
    // ตัดแถวว่างที่ไม่มี Job I ออก
    const rows = this.datas.filter(
      row => String(row.jobI ?? '').trim() !== ''
    );

    this.totalShipments = rows.length;

    this.totalCartons = rows.reduce(
      (sum, row) => sum + this.toNumber(row.cartons),
      0
    );

    this.totalCbm = rows.reduce(
      (sum, row) => sum + this.toNumber(row.cbm),
      0
    );

    // 1. จำนวน Shipment แยกตาม Carrier
    const carrierCounts = new Map<string, number>();

    for (const row of rows) {
      const carrier = String(
        row.carrierName ?? ''
      ).trim() || 'ไม่ระบุ';

      carrierCounts.set(
        carrier,
        (carrierCounts.get(carrier) ?? 0) + 1
      );
    }

    const carriers = [...carrierCounts.entries()]
      .sort((a, b) => b[1] - a[1]);

    this.carrierChartData = {
      labels: carriers.map(([name]) => name),
      datasets: [{
        label: 'จำนวน Shipment',
        data: carriers.map(([, count]) => count),
        backgroundColor: '#3B82F6',
        borderRadius: 6,
      }],
    };

    // 2. สัดส่วน Container Size
    const containerCounts = new Map<string, number>();

    for (const row of rows) {
      const size = String(
        row.containerSize ?? ''
      ).trim() || 'ไม่ระบุ';

      containerCounts.set(
        size,
        (containerCounts.get(size) ?? 0) + 1
      );
    }

    this.containerChartData = {
      labels: [...containerCounts.keys()],
      datasets: [{
        data: [...containerCounts.values()],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#8B5CF6',
          '#F43F5E',
          '#06B6D4',
        ],
      }],
    };

    // 3. รวม Cartons แยกตาม Origin Port
    const cartonsByOrigin = new Map<string, number>();

    for (const row of rows) {
      const origin = String(
        row.originPortName ?? ''
      ).trim() || 'ไม่ระบุ';

      cartonsByOrigin.set(
        origin,
        (cartonsByOrigin.get(origin) ?? 0)
          + this.toNumber(row.cartons)
      );
    }

    const origins = [...cartonsByOrigin.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    this.originChartData = {
      labels: origins.map(([name]) => name),
      datasets: [{
        label: 'จำนวน Cartons',
        data: origins.map(([, count]) => count),
        backgroundColor: '#10B981',
        borderRadius: 6,
      }],
    };
  }

  private toNumber(value: unknown): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const number = Number(value);
      return Number.isFinite(number) ? number : 0;
    }

    return 0;
  }
}
