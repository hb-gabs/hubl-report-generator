let fileButton = document.querySelector('#myfile');
let dateInput = document.querySelector('#date');
let filterSelection = document.querySelector('#types');
let genReport = document.querySelector('#gen-report');
let resetReport = document.querySelector('#reset-report');

let reader = new FileReader();
let data;
let data_obj = {};
let dm;

class DataManager {
  constructor(
    df
  ) {
    this.odf = df;
    this.df = df;
    this.nrow = null;
    this.ncols = null;
    this.cols_names = null; 
    this.report = {

    }
  }

  get_column_data(column_name)  {
    let index = this.df[0].indexOf(column_name);
    return this.df.map(data => data[index]);
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

  analysis(column_name) {
    let column_data = this.get_column_data(column_name);
    let unique_values =  column_data.filter(this.unique);
    let values_quantities = unique_values.map(val => column_data.filter(v => v===val).length);
    [values_quantities, unique_values] = this.sort_arrays(values_quantities, unique_values);
    return {
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
    try {
      return Number(string.slice(0,2));
    } catch (error) {
      return '';      
    }
  }

  getMonth(string) {
    try {
      return Number(string.slice(3,5));
    } catch (error) {
      return '';      
    }
  }

  getYear(string) {
    try {
      return Number(string.slice(6,10));
    } catch (error) {
      return '';      
    }
  }

  filter_by_date(date=[2022,11,11], mode='month') {
    let idate = this.df[0].indexOf('Aberto em');
    let [year, month, day] = date;
    if(mode === 'month') {
      this.df = this.df.filter(array => month==this.getMonth(array[idate]) && year==this.getYear(array[idate]));
    } else if(mode === 'exact') {
      this.df = this.df.filter(array => day==this.getDay(array[idate])  && year==this.getYear(array[idate]))
    } else if(mode === 'before') {
      this.df = this.df.filter(array => {
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
    } else if(mode === 'after') {
      this.df = this.df.filter(array => {
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
    } else {
      return this.df;
    }
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
  let selectedDate = dateInput.value.split('-');
  let filterType = filterSelection.value;
  reader.readAsText(fileButton.files[0]);

  setTimeout(() => {

    dm = new DataManager(data);

    console.log('selectedDate =>', selectedDate);
    console.log('filterType =>', filterType);
    dm.filter_by_date(date=selectedDate, mode=filterType)

    // console.log('dm.analise_de_categorias =>', dm.analise_de_categorias());
    // console.log('dm.analise_de_servicos() =>', dm.analise_de_servicos());
    // console.log('dm.analise_de_status() =>', dm.analise_de_status());
    // console.log('data =>', data);
    // console.log('filtering =>', dm.filter_by_columns({
    //   'Categoria': [
    //     'Solicitação de registro ',
    //   ],
    //   'Urgência': [
    //     'Média'
    //   ]
    // }));

    console.log('dm.df =>', dm.df);

  }, 100);
}

resetReport.onclick = () => {
  dm.reset_df();
}