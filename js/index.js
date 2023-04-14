import { DataManager } from "./data-manager.js";
import { insert, create, insertParameters, insertStyle, sorting } from "./utils.js";

let fileButton = document.querySelector('#myfile');
let dateInput = document.querySelector('#date');
let filterSelection = document.querySelector('#types');
let genReport = document.querySelector('#gen-report');
let reportContainer = document.querySelector('.report');
let nmaxInput = document.querySelector('#max-items');
let colItemsDiv = document.querySelector('#columns-items');
let checks = [];
let n_renders = 0;

let reader = new FileReader();
let dm;
let data;

nmaxInput.value = 10;

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

    let filtered_df = dm.filter_by_date(selectedDate, filterType);
    let n_total = filtered_df.length;

    let report = genReportByColumns(dm, filtered_df);

    let workedHours = dm.genWorkedHoursMean()

    render(report, n_total, workedHours);
  }, 100);
}

const genReportByColumns = (dm, filtered_df) => {
  let report = [];
  dm.cols_names.map((name, index) => checks[index] && report.push(dm.analysis(name, filtered_df)));
  return report;
}

const render = (report, n_total, hours) => {
  if(report[0].values.length>0) {
    let h3 = create('h3', {
      innerHTML: `TOTAL: ${n_total}`
    });
    insert(reportContainer, h3);

    let h4 = create('h4', {
      innerHTML: `Média de tempo de conclusão: ${hours.toFixed(1)} horas`
    })
    insert(reportContainer, h4);

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
    })
  }
}

const checkBoxClick = (index) => {
  checks[index] = !checks[index];
}

const clearContent = () => {
  while(reportContainer.firstChild) {
    reportContainer.removeChild(reportContainer.lastChild);
  }
}