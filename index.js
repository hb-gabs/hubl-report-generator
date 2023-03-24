let fileButton = document.querySelector('#myfile');
let dateInput = document.querySelector('#date');
let filterSelection = document.querySelector('#types');
let genReport = document.querySelector('#gen-report');
let reportContainer = document.querySelector('.report');
let nmaxInput = document.querySelector('#max-items');
let colItemsDiv = document.querySelector('#columns-items');
let checks = [];

nmaxInput.value = 10;

let reader = new FileReader();
let dm;
let data;
let data_obj = {};

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
  let columns_names = data[0];
  for(let i=0; i<columns_names.length; i++) {
    data_obj = {...data_obj, [columns_names[i]]: data.map((array) => array[i].replace('\r','')).slice(1)}; 
  }
  data = data.map(val => val.map((v, i) => i===val.length-1 ? v.replace('\r','') : v));
}

genReport.onclick = () => {
  while(reportContainer.firstChild) {
    reportContainer.removeChild(reportContainer.lastChild);
  }

  let selectedDate = dateInput.value.split('-');
  let filterType = filterSelection.value;

  try {
    reader.readAsText(fileButton.files[0]);
  } catch (error) {
    let h3 = document.createElement('h3');
    h3.innerHTML = 'Erro ao carregar o arquivo!';
    h3.style.color = 'red';
    reportContainer.appendChild(h3);
    return;    
  }

  setTimeout(() => {
    dm = new DataManager(data);

    renderCheckboxes(dm.cols_names);

    let filtered_df = dm.filter_by_date(date = selectedDate, mode = filterType);
    let n_total = filtered_df.length;
    let status_analysis = dm.analysis('Status', filtered_df);
    let category_analysis = dm.analysis('Categoria', filtered_df);
    let services_analysis = dm.analysis('Serviço (Completo)', filtered_df);
    let report = [status_analysis, category_analysis, services_analysis];
    render(report, n_total);
  }, 100);
}

const render = (report, n_total) => {
  if(report[0].values.length>0) {
    let h3 = document.createElement('h3');
    h3.innerHTML = `TOTAL: ${n_total}`;
    reportContainer.appendChild(h3);

    report.map(info => {
      let h3 = document.createElement('h3');
      h3.innerHTML = info.name;
      let ul = document.createElement('ul');
      let L = info.values.length;
      let max = Number(nmaxInput.value) > L ? L : Number(nmaxInput.value); 
      for(let i=0; i<max; i++) {
        let li = document.createElement('li');
        let p = document.createElement('p');
        p.innerHTML = `${info.values[i]}: ${info.quantities[i]}`;
        li.appendChild(p);
        ul.appendChild(li);
      }
      reportContainer.appendChild(h3);
      reportContainer.appendChild(ul);
    })
  } else {
    let h3 = document.createElement('h3');
    h3.innerHTML = 'Não há registro para a data solicitada.';
    h3.style.color = 'red';
    reportContainer.appendChild(h3);
  }
}

const renderCheckboxes = (cols_names) => {
  cols_names.map((name, index) => {
    let label = document.createElement('label');
    label.innerHTML = name;
    label.className += 'checkbox';
    let checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.onclick = () => checkBoxClick(index);
    checkBox.checked = true;
    let div = document.createElement('div');
    div.appendChild(checkBox);
    div.appendChild(label);
    colItemsDiv.appendChild(div);
    checks.push(true);
    console.log(checkBox);
  })
  console.log(checks);
}

const checkBoxClick = (index) => {
  checks[index] = !checks[index];
  console.log(index);
  console.log(checks);
}