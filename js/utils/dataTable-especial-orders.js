//Ordena por data em formato BRL
jQuery.extend(jQuery.fn.dataTableExt.oSort, {
  "date-time-br-pre": function (dateTimeStr) {
    let parts;
    let dateParts;
    let timeParts;
    let year;
    let month;
    let day;
    let hours;
    let minutes;
    let seconds;
    let dateTime;

    if (!dateTimeStr || dateTimeStr === "") {
      return console.warn('Um dos campos definidos com tipo date-time-br, não está preenchido ou não é do tipo date-time');
    }

    if (dateTimeStr.includes('>')) {
      dateTimeStr = $(dateTimeStr).text();
    }

    if (dateTimeStr?.includes('T')) {
      parts = dateTimeStr?.split('T');
      dateParts = parts[0]?.includes('.') ? parts[0]?.split('.') : parts[0]?.split('-');
      timeParts = (parts[1] || '00:00:00')?.split(':');
      year = parseInt(dateParts[0], 10);
      month = parseInt(dateParts[1], 10) - 1;
      day = parseInt(dateParts[2], 10);
      hours = parseInt(timeParts[0], 10);
      minutes = parseInt(timeParts[1], 10);
      seconds = parseInt(timeParts[2]?.includes('.') ? timeParts[2]?.split('.')[0] : timeParts[2], 10);
      dateTime = new Date(year, month, day, hours, minutes, seconds);

    } else {
      parts = dateTimeStr?.split(' ');
      dateParts = parts[0]?.includes('/') ? parts[0]?.split('/') : parts[0]?.split('-');
      timeParts = (parts[1] || '00:00:00')?.split(':');
      year = parseInt(dateParts[2], 10);
      month = parseInt(dateParts[1], 10) - 1;
      day = parseInt(dateParts[0], 10);
      hours = parseInt(timeParts[0], 10);
      minutes = parseInt(timeParts[1], 10);
      seconds = parseInt(timeParts[2], 10);
      dateTime = new Date(year, month, day, hours, minutes, seconds);
    }

    return dateTime.getTime(); // Retorna a data em milissegundos
  },
});

//Ordena por valores monetarios em formato BRL
$.extend($.fn.dataTable.ext.type.order, {
  "currency-brl-pre": function (a) {

    if (a.includes('>')) {
      a = $(a).text();
    }

    a = a.toString().replace(/[\.]/g, "");
    a = a.toString().replace(/[\,]/g, ".");
    a = a.toString().replace(/[^\d.-]/g, "");
    a = parseFloat(a);
    if (!isNaN(a)) {
      return a;
    } else {
      return -99999999999999;
    }
  },
  "currency-brl-asc": function (a, b) {
    return a - b;
  },
  "currency-brl-desc": function (a, b) {
    return b - a;
  }
});

$.extend($.fn.dataTable.ext.order['input-checkbox'] = function (settings, col) {
  return this.api()
    .column(col, { order: 'index' })
    .nodes()
    .map(function (td) {
      let idx = 0;

      if ($('input[type="checkbox"]', td).length == 0) {
        idx = 2;
      } else {
        idx = $('input[type="checkbox"]', td).prop('checked') ? 0 : 1;
      }

      return idx;
    });
})

$.extend($.fn.dataTable.ext.order['input-number'] = function (settings, col) {
  return this.api()
    .column(col, { order: 'index' })
    .nodes()
    .map(function (td) {
      return Number($('input[type="number"]', td).val() || 0);
    });
})