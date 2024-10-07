import { NzCustomColumn } from 'ng-zorro-antd/table';

export interface CustomColumn extends NzCustomColumn {
  name: string;
  required?: boolean;
  position?: 'left' | 'right';
}