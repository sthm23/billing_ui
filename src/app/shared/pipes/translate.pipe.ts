import { Pipe, PipeTransform } from "@angular/core";
import { MultiSelectType } from "../../models/app.models";
import { Category } from "../../models/product.model";


@Pipe({
  name: 'translatePipe',
  standalone: true
})
export class TranslatePipe implements PipeTransform {

  transform(value: MultiSelectType[], translate: Record<string, string>, categoryArr: Category[], ...args: any[]): MultiSelectType[] {
    return this.makeSelectTypes(value, translate, categoryArr);
  }

  makeSelectTypes(data: MultiSelectType[], translateObj: Record<string, string>, categoryArr: Category[]): MultiSelectType[] {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const category = categoryArr[i];
      if (item.children && item.children.length) {
        result.push({
          key: item.key,
          label: translateObj[category.name] || category.name,
          icon: 'pi pi-fw pi-folder',
          children: this.makeSelectTypes(item.children, translateObj, categoryArr[i].children || [])
        });
      } else {
        result.push({
          key: item.key,
          label: translateObj[category.name] || category.name,
          icon: 'pi pi-fw pi-clipboard',
        });

      }
    }
    return result as MultiSelectType[];
  }
}
