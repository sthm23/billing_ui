import { Injectable, OnDestroy, OnInit } from "@angular/core";
import { TranslocoService } from "@ngneat/transloco";
import { PrimeNG } from "primeng/config";
import { BehaviorSubject } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class TranslateService {

  currentLang$ = new BehaviorSubject<string>('ru');
  defaultLanguage = 'ru';

  constructor(
    private translocoService: TranslocoService,
    private config: PrimeNG
  ) {

  }

  selectTranslateObject(key: string) {
    return this.translocoService.selectTranslateObject<Record<string, string>>(key)
  }

  translateObject(key: string) {
    return this.translocoService.translateObject<Record<string, string>>(key)
  }

  setActiveLang(lang: string) {
    this.currentLang$.next(lang);
    this.translocoService.setActiveLang(lang);
    this.setLocale(this.config, lang);
    localStorage.setItem('my_billing_lang', lang);
  }

  setLocale(config: PrimeNG, locale: string): void {
    switch (locale.toLowerCase()) {
      case 'en': {
        config.setTranslation({
          startsWith: 'Starts with',
          contains: 'Contains',
          notContains: 'Not contains',
          endsWith: 'Ends with',
          equals: 'Equals',
          notEquals: 'Not equals',
          noFilter: 'No Filter',
          lt: 'Less than',
          lte: 'Less than or equal to',
          gt: 'Greater than',
          gte: 'Greater than or equal to',
          dateIs: 'Date is',
          dateIsNot: 'Date is not',
          dateBefore: 'Date is before',
          dateAfter: 'Date is after',
          clear: 'Clear',
          apply: 'Apply',
          matchAll: 'Match All',
          matchAny: 'Match Any',
          addRule: 'Add Rule',
          removeRule: 'Remove Rule',
          accept: 'Yes',
          reject: 'No',
          choose: 'Choose',
          upload: 'Upload',
          cancel: 'Cancel',
          completed: 'Completed',
          pending: 'Pending',
          fileSizeTypes: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
          dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
          monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          chooseYear: 'Choose Year',
          chooseMonth: 'Choose Month',
          chooseDate: 'Choose Date',
          prevDecade: 'Previous Decade',
          nextDecade: 'Next Decade',
          prevYear: 'Previous Year',
          nextYear: 'Next Year',
          prevMonth: 'Previous Month',
          nextMonth: 'Next Month',
          prevHour: 'Previous Hour',
          nextHour: 'Next Hour',
          prevMinute: 'Previous Minute',
          nextMinute: 'Next Minute',
          prevSecond: 'Previous Second',
          nextSecond: 'Next Second',
          am: 'am',
          pm: 'pm',
          today: 'Today',
          weekHeader: 'Wk',
          firstDayOfWeek: 0,
          dateFormat: 'mm/dd/yy',
          weak: 'Weak',
          medium: 'Medium',
          strong: 'Strong',
          passwordPrompt: 'Enter a password',
          emptyFilterMessage: 'No results found',
          searchMessage: '{0} results are available',
          selectionMessage: '{0} items selected',
          emptySelectionMessage: 'No selected item',
          emptySearchMessage: 'No results found',
          emptyMessage: 'No available options',
        })
        break
      }
      case 'ru': {
        config.setTranslation({
          startsWith: 'Начинается с',
          contains: 'Содержит',
          notContains: 'Не содержит',
          endsWith: 'Заканчивается на',
          equals: 'Равно',
          notEquals: 'Не равно',
          noFilter: 'Без фильтра',
          lt: 'Меньше чем',
          lte: 'Меньше или равно',
          gt: 'Больше чем',
          gte: 'Больше или равно',
          is: 'Равно',
          isNot: 'Не равно',
          before: 'До',
          after: 'После',
          apply: 'Применить',
          matchAll: 'Совпадает со всеми',
          matchAny: 'Совпадает с любым',
          addRule: 'Добавить правило',
          removeRule: 'Удалить правило',
          accept: 'Принять',
          reject: 'Отклонить',
          choose: 'Выбрать',
          upload: 'Загрузить',
          cancel: 'Отмена',
          dayNames: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
          dayNamesShort: ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'],
          dayNamesMin: ['П', 'В', 'С', 'Ч', 'П', 'С', 'В'],
          monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Августь', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
          monthNamesShort: ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
          today: 'Сегодня',
          clear: 'Очистить',
          weekHeader: 'Неделя',
          passwordPrompt: 'Вводите пароль',
          emptyFilterMessage: 'Нет результатов',
          searchMessage: 'Доступно {0} результатов',
          selectionMessage: 'Выбрано {0} элементов',
          emptySelectionMessage: 'Нет выбранных элементов',
          emptySearchMessage: 'Нет результатов',
          emptyMessage: 'Нет доступных опций',
        });
        break;
      }
      case 'uz': {
        config.setTranslation({
          startsWith: 'Boshlanadi',
          contains: 'O‘z ichiga oladi',
          notContains: 'O‘z ichiga olmaydi',
          endsWith: 'Bilan tugaydi',
          equals: 'Teng',
          notEquals: 'Teng emas',
          noFilter: 'Filtr yo‘q',
          lt: 'Kamroq',
          lte: 'Kamroq yoki teng',
          gt: 'Ko‘proq',
          gte: 'Ko‘proq yoki teng',
          is: 'Teng',
          isNot: 'Teng emas',
          before: 'Oldin',
          after: 'Keyin',
          apply: 'Qo‘llash',
          matchAll: 'Hammasiga mos keladi',
          matchAny: 'Har biriga mos keladi',
          addRule: 'Qoidani qo‘shish',
          removeRule: 'Qoidani o‘chirish',
          accept: 'Qabul qilish',
          reject: 'Rad etish',
          choose: 'Tanlash',
          upload: 'Yuklash',
          cancel: 'Bekor qilish',
          dayNames: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'],
          dayNamesShort: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
          dayNamesMin: ['D', 'S', 'Ch', 'P', 'J', 'Sh', 'Y'],
          monthNames: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
          monthNamesShort: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
          today: 'Bugun',
          clear: 'Tozalash',
          weekHeader: 'Hafta',
          passwordPrompt: 'Parolni kiriting',
          emptyFilterMessage: 'Natija topilmadi',
          searchMessage: '{0} natija mavjud',
          selectionMessage: '{0} element tanlandi',
          emptySelectionMessage: 'Hech qanday element tanlanmagan',
          emptySearchMessage: 'Natija topilmadi',
          emptyMessage: 'Mavjud variantlar yo‘q',
        });
        break;
      }
      default: {
        break;
      }
    }
  }
}
