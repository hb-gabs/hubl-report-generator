let fileButton = document.querySelector('#myfile');
let dateInput = document.querySelector('#date');
let filterSelection = document.querySelector('#types');
let genReport = document.querySelector('#gen-report');
let reportContainer = document.querySelector('.report');
let nmaxInput = document.querySelector('#max-items');
let colItemsDiv = document.querySelector('#columns-items');
let checks = [];
let checkBoxesContainers = [];
let n_renders = 0;

let reader = new FileReader();
let dm;
let data;

nmaxInput.value = 10;

class DataManager {
  constructor(df) {
    this.odf = df;
    this.df = df;
    this.nrow = df.length;
    this.ncols = df[0].length;
    this.cols_names = df[0]; 
  }

  get_column_data(column_name, df)  {
    let index = this.cols_names.indexOf(column_name);
    return df.map(data => data[index]);
  }

  unique(value, index, array) {
    return array.indexOf(value) === index;
  }

  sort_arrays(narr, sarr) {
    let narr_copy = narr.map(val => val);
    let sort_narr = narr.sort((a,b) => b-a);
    let sort_sarr = narr_copy.map(val => sarr[sort_narr.indexOf(val)]);
    return [sort_narr, sort_sarr];
  }

  analysis(column_name, df=null) {
    if(df===null) df=this.df;
    let column_data = this.get_column_data(column_name, df);
    let unique_values =  column_data.filter(this.unique);
    let values_quantities = unique_values.map(val => column_data.filter(v => v===val).length);
    [values_quantities, unique_values] = this.sort_arrays(values_quantities, unique_values);
    return {
      name: column_name,
      values: unique_values,
      quantities: values_quantities
    }
  }

  reset_df() {
    this.df = this.odf;
  }

  filter_by_columns(obj) {
    let obj_keys = Object.keys(obj);
    let filtered_df = this.df.filter(array => {
      let n_keys = obj_keys.length;
      let count = 0;
      obj_keys.map(key => {
        let includes = false;
        obj[key].map(val => {
          array.map(v => {
            if(v===val) {
              includes = true;
            }
          })
        })
        if(includes) count+=1;
      })
      return n_keys === count;
    })
    return filtered_df;
  }

  getDay(string) {
    return Number(string.slice(0,2));
  }

  getMonth(string) {
    return Number(string.slice(3,5));
  }

  getYear(string) {
    return Number(string.slice(6,10));
  }

  filter_by_date(date=[2022,11,11], mode='month') {
    let idate = this.cols_names.indexOf('Aberto em');
    let [year, month, day] = date;

    if(mode === 'month') {
      return this.df.filter(array => month==this.getMonth(array[idate]) && year==this.getYear(array[idate]));
    }

    if(mode === 'exact') {
      return this.df.filter(array => day==this.getDay(array[idate])  && year==this.getYear(array[idate]))
    }
    
    if(mode === 'before') {
      return this.df.filter(array => {
        if(this.getYear(array[idate])<year) {
          return true;
        }
        if(this.getYear(array[idate])>year) {
          return false;
        }
        if(this.getMonth(array[idate])>month) {
          return false;
        }
        if(this.getMonth(array[idate])<month) {
          return true;
        }
        if(this.getDay(array[idate])>day) {
          return false;
        }
        if(this.getDay(array[idate])<=day) {
          return true;
        }
      })
    }
    
    if(mode === 'after') {
      return this.df.filter(array => {
        if(this.getYear(array[idate])<year) {
          return false;
        }
        if(this.getYear(array[idate])>year) {
          return true;
        }
        if(this.getMonth(array[idate])>month) {
          return true;
        }
        if(this.getMonth(array[idate])<month) {
          return false;
        }
        if(this.getDay(array[idate])<day) {
          return false;
        }
        if(this.getDay(array[idate])>=day) {
          return true;
        }
      })
    }

    if(mode === 'default') {
      return this.df;
    }

    console.error('Tipo de filtragem não especificada.');
  }
}

reader.onload = e => {
  let data_tsv = e.target.result;
  let data_rows = data_tsv.split('\n');
  data = data_rows.map(dt => dt.split('\t'));
  data = data.map(val => val.map((v, i) => i===val.length-1 ? v.replace('\r','') : v));
}

genReport.onclick = () => {
  clearContent();

  n_renders+=1;

  let selectedDate = dateInput.value.split('-');
  let filterType = filterSelection.value;

  try {
    reader.readAsText(fileButton.files[0]);
  } catch (error) {
    let h3 = create('h3', {
      innerHTML: 'Erro ao carregar o arquivo!',
      style: {
        color: 'red'
      }
    });
    insert(reportContainer, h3);
    return;    
  }

  setTimeout(() => {
    dm = new DataManager(data);

    renderCheckboxes(dm.cols_names);

    let filtered_df = dm.filter_by_date(date = selectedDate, mode = filterType);
    let n_total = filtered_df.length;

    let report = genReportByColumns(dm, filtered_df);

    render(report, n_total);
  }, 100);
}

const genReportByColumns = (dm, filtered_df) => {
  let report = [];
  dm.cols_names.map((name, index) => checks[index] && report.push(dm.analysis(name, filtered_df)));
  return report;
}

const render = (report, n_total) => {
  if(report[0].values.length>0) {
    let h3 = create('h3', {
      innerHTML: `TOTAL: ${n_total}`
    });
    insert(reportContainer, h3);

    report.map(info => {
      let h3 = create('h3', {
        innerHTML: info.name
      });
      let ul = create('ul');
      let L = info.values.length;
      let max = Number(nmaxInput.value) > L ? L : Number(nmaxInput.value); 
      for(let i=0; i<max; i++) {
        let li = create('li');
        let p = create('p', {
          innerHTML: `${info.values[i]}: ${info.quantities[i]}`
        });
        insert(li, p);
        insert(ul, li);
      }
      insert(reportContainer, h3);
      insert(reportContainer, ul);
    })
  } else {
    let h3 = create('h3', {
      innerHTML: 'Não há registro para a data solicitada.',
      style: {
        color: 'red'
      }
    })
    insert(reportContainer, h3);
  }
}

const renderCheckboxes = (cols_names) => {
  if(n_renders === 1) {
    cols_names.map((name, index) => {
      let label = create('label', {
        innerHTML: name
      });
      label.className += 'checkbox';
  
      let checkBox = create('input', {
        type: 'checkbox',
        onclick: () => checkBoxClick(index),
        checked: true
      });
  
      let div = create('div');
      insert(div, [checkBox, label]);
      insert(colItemsDiv, [div]);
      checks.push(true);
      checkBoxesContainers.push(div);
    })
  }
}

const checkBoxClick = (index) => {
  checks[index] = !checks[index];
}

const insert = (parent, elements) => {
  if(typeof(elements.length) !== 'undefined') {
    elements.map(element => parent.appendChild(element));
  } else {
    parent.appendChild(elements);
  }
}

const create = (elementName, parameters = null) => {
  let element = document.createElement(elementName);
  if(parameters) {
    insertParameters(element, parameters);
    if(parameters.style) {
      insertStyle(element, parameters.style);
    }
  }
  return element;
}

const insertParameters = (element, parameters) => {
  Object.keys(parameters).map(key => element[key] = parameters[key]);
}

const insertStyle = (element, parameters) => {
  Object.keys(parameters).map(key => element['style'][key] = parameters[key]);
}

const clearContent = () => {
  while(reportContainer.firstChild) {
    reportContainer.removeChild(reportContainer.lastChild);
  }
}