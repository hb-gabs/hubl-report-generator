let fileButton = document.querySelector('#myfile');
let date = document.querySelector('#date');
let filterSelection = document.querySelector('#types');
let genReport = document.querySelector('#gen-report');

let reader = new FileReader();
let data = null;

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

  analise_de_categorias() {
    let column_data = this.get_column_data('Categoria');
    let unique_values =  column_data.filter(this.unique);
    let values_quantities = unique_values.map(val => column_data.filter(v => v===val).length);
    [values_quantities, unique_values] = this.sort_arrays(values_quantities, unique_values);
    return {
      value: unique_values,
      quantities: values_quantities
    }
  }

  analise_de_servicos() {
    let column_data = this.get_column_data('Serviço (Completo)');
    let unique_values =  column_data.filter(this.unique);
    let values_quantities = unique_values.map(val => column_data.filter(v => v===val).length);
    [values_quantities, unique_values] = this.sort_arrays(values_quantities, unique_values);
    return {
      value: unique_values,
      quantities: values_quantities
    }
  }

  analise_de_status() {
    let column_data = this.get_column_data('Status');
    let unique_values =  column_data.filter(this.unique);
    let values_quantities = unique_values.map(val => column_data.filter(v => v===val).length);
    [values_quantities, unique_values] = this.sort_arrays(values_quantities, unique_values);
    return {
      value: unique_values,
      quantities: values_quantities
    }
  }
}

reader.onload = e => {
  let data_csv = e.target.result;
  let data_rows = data_csv.split('\n');
  data = data_rows.map(dt => dt.split('\t'));
  data = data.map(val => val.map((v, i) => i===val.length-1 ? v.replace('\r','') : v));
}

genReport.onclick = () => {
  let [day, month, year] = date.value.split('-');
  let filterType = filterSelection.value;
  reader.readAsText(fileButton.files[0]);

  setTimeout(() => {

    let dm = new DataManager(data);

    console.log('dm.analise_de_categorias =>', dm.analise_de_categorias());
    console.log('dm.analise_de_servicos() =>', dm.analise_de_servicos());
    console.log('dm.analise_de_status() =>', dm.analise_de_status());
    console.log('data =>', data);
    
  }, 100);
}
