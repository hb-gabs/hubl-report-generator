import { sorting } from "./utils.js";


export class DataManager {
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
      let sort_narr = narr_copy.sort((a,b) => a-b);
      let sort_sarr = sort_narr.map(val => sarr[narr.findIndex(v => v === val)]);

      return [sort_narr, sort_sarr];
    }
  
    analysis(column_name, df=null) {
      if(df===null) df=this.df;
      let column_data = this.get_column_data(column_name, df);
      column_data.shift();
      let unique_values =  column_data.filter(this.unique);
      let values_quantities = unique_values.map(val => column_data.filter(v => v===val).length);
      const [qtt_sorted, qtt_sorted_indexes] = sorting(values_quantities);
      const unique_values_sorted = qtt_sorted_indexes.map(ind => unique_values[ind]);
      return {
        name: column_name,
        values: unique_values_sorted,
        quantities: qtt_sorted
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