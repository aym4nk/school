(function () {
  'use strict';

  const $ = s => document.querySelector(s);

  /* =========================
     AUTH
  ========================= */
  function ensureAuth() {
    if (!window.Auth || !Auth.getCurrentUser()) {
      window.location.href = 'index.html';
    }
  }

  /* =========================
     STORAGE
  ========================= */
  function store(key) {
    return {
      get() {
        return JSON.parse(localStorage.getItem(key) || '[]');
      },
      save(data) {
        localStorage.setItem(key, JSON.stringify(data));
      },
      add(item) {
        item.id = Date.now().toString();
        const data = this.get();
        data.push(item);
        this.save(data);
      },
      update(id, patch) {
        const data = this.get();
        const i = data.findIndex(x => x.id === id);
        if (i !== -1) {
          data[i] = { ...data[i], ...patch };
          this.save(data);
        }
      },
      remove(id) {
        this.save(this.get().filter(x => x.id !== id));
      },
      find(id) {
        return this.get().find(x => x.id === id);
      }
    };
  }

  const Students = store('students');
  const Subjects = store('subjects');
  const Teachers = store('teachers');

  /* =========================
     NAVIGATION
  ========================= */
  function setupNavigation() {
    [
      ['#nav-home', '#panel-home'],
      ['#nav-students', '#panel-students'],
      ['#nav-subjects', '#panel-subjects'],
      ['#nav-teachers', '#panel-teachers']
    ].forEach(([btn, panel]) => {
      $(btn).onclick = () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

        $(btn).classList.add('active');
        $(panel).classList.add('active');

        if (panel === '#panel-home') {
  setTimeout(() => {
    renderStats();
  }, 50);
}

      };
    });
  }

  /* =========================
     DASHBOARD STATS
  ========================= */
  function renderStats() {
    $('#count-students').textContent = Students.get().length;
    $('#count-subjects').textContent = Subjects.get().length;
    $('#count-teachers').textContent = Teachers.get().length;
  }

  /* =========================
     STUDENTS
  ========================= */
  function renderStudents() {
    const tbody = $('#studentsTable tbody');
    tbody.innerHTML = '';

    Students.get().forEach(s => {
      tbody.innerHTML += `
        <tr>
          <td>${s.name}</td>
          <td>${s.sexe}</td>
          <td>${s.classroom}</td>
          <td>
            <button data-edit="${s.id}">Modifier</button>
            <button data-del="${s.id}">Suppr</button>
          </td>
        </tr>`;
    });

    tbody.querySelectorAll('[data-edit]').forEach(b =>
      b.onclick = () => editStudent(b.dataset.edit)
    );
    tbody.querySelectorAll('[data-del]').forEach(b =>
      b.onclick = () => { Students.remove(b.dataset.del); renderStudents(); }
    );
  }

  function editStudent(id) {
    const s = Students.find(id);
    if (!s) return;
    const f = $('#studentForm');
    f.id.value = s.id;
    f.name.value = s.name;
    f.sexe.value = s.sexe;
    f.classroom.value = s.classroom;
  }

function studentFormInit() {
  const f = $('#studentForm');

  f.onsubmit = e => {
    e.preventDefault();

    const data = {
      name: f.name.value,
      sexe: f.sexe.value,
      classroom: f.classroom.value
    };

    if (f.id.value) {
      Students.update(f.id.value, data);
    } else {
      Students.add(data);
    }

    f.reset();
    f.id.value = ''; // 👈 IMPORTANT : vider l'id

    renderStudents();
    renderStats();
  };

  $('#studentCancel').onclick = () => {
    f.reset();
    f.id.value = ''; // 👈 IMPORTANT AUSSI
  };
}


  /* =========================
     SUBJECTS
  ========================= */
  function renderSubjects() {
    const tbody = $('#subjectsTable tbody');
    tbody.innerHTML = '';

    Subjects.get().forEach(s => {
      tbody.innerHTML += `
        <tr>
          <td>${s.name}</td>
          <td>${s.code}</td>
          <td>
            <button data-edit="${s.id}">Modifier</button>
            <button data-del="${s.id}">Suppr</button>
          </td>
        </tr>`;
    });

    tbody.querySelectorAll('[data-edit]').forEach(b =>
      b.onclick = () => editSubject(b.dataset.edit)
    );
    tbody.querySelectorAll('[data-del]').forEach(b =>
      b.onclick = () => { Subjects.remove(b.dataset.del); renderSubjects(); }
    );
  }

  function editSubject(id) {
    const s = Subjects.find(id);
    const f = $('#subjectForm');
    f.id.value = s.id;
    f.name.value = s.name;
    f.code.value = s.code;
  }

  function subjectFormInit() {
    const f = $('#subjectForm');
    f.onsubmit = e => {
      e.preventDefault();
      const data = { name: f.name.value, code: f.code.value };
      f.id.value ? Subjects.update(f.id.value, data) : Subjects.add(data);
      f.reset();
      renderSubjects();
    };
    $('#subjectCancel').onclick = () => f.reset();
  }

  /* =========================
     TEACHERS
  ========================= */
  function renderTeachers() {
    const tbody = $('#teachersTable tbody');
    tbody.innerHTML = '';

    Teachers.get().forEach(t => {
      tbody.innerHTML += `
        <tr>
          <td>${t.name}</td>
          <td>${t.email}</td>
          <td>${t.subject}</td>
          <td>
            <button data-edit="${t.id}">Modifier</button>
            <button data-del="${t.id}">Suppr</button>
          </td>
        </tr>`;
    });

    tbody.querySelectorAll('[data-edit]').forEach(b =>
      b.onclick = () => editTeacher(b.dataset.edit)
    );
    tbody.querySelectorAll('[data-del]').forEach(b =>
      b.onclick = () => { Teachers.remove(b.dataset.del); renderTeachers(); }
    );
  }

  function editTeacher(id) {
    const t = Teachers.find(id);
    const f = $('#teacherForm');
    f.id.value = t.id;
    f.name.value = t.name;
    f.email.value = t.email;
    f.subject.value = t.subject;
  }

  function teacherFormInit() {
    const f = $('#teacherForm');
    f.onsubmit = e => {
      e.preventDefault();
      const data = {
        name: f.name.value,
        email: f.email.value,
        subject: f.subject.value
      };
      f.id.value ? Teachers.update(f.id.value, data) : Teachers.add(data);
      f.reset();
      renderTeachers();
    };
    $('#teacherCancel').onclick = () => f.reset();
  }

  /* =========================
     LOGOUT
  ========================= */
  function setupLogout() {
    $('#logoutBtn').onclick = () => Auth.logout();
  }

  /* =========================
     INIT
  ========================= */
  document.addEventListener('DOMContentLoaded', () => {
    ensureAuth();

    // Force Accueil au chargement
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    $('#panel-home').classList.add('active');
    $('#nav-home').classList.add('active');

    setupNavigation();
    studentFormInit();
    subjectFormInit();
    teacherFormInit();
    renderStudents();
    renderSubjects();
    renderTeachers();
    renderStats();
    setupLogout();
  });
  function renderStats() {
    $('#count-students').textContent = Students.get().length;
    $('#count-subjects').textContent = Subjects.get().length;
    $('#count-teachers').textContent = Teachers.get().length;

    renderChart();
    renderGenderChart();
  }
let chart = null;

function renderChart() {
  const canvas = document.getElementById('dashboardChart');
  if (!canvas) return;

  const students = Students.get().length;
  const subjects = Subjects.get().length;
  const teachers = Teachers.get().length;

  const ctx = canvas.getContext('2d');

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Élèves', 'Matières', 'Professeurs'],
      datasets: [{
        data: [students, subjects, teachers],
        backgroundColor: [
          '#4da3ff',
          '#a30023ff',
          '#5cd65c'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}
let genderChart = null;

function renderGenderChart() {
  const students = Students.get();

  let male = 0;
  let female = 0;

  students.forEach(s => {
    if (!s.sexe) return;
    const sexe = s.sexe.toLowerCase();
    if (sexe === 'male' || sexe === 'jeune') male++;
    if (sexe === 'female' || sexe === 'fille') female++;
  });

  const canvas = document.getElementById('genderChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (genderChart) genderChart.destroy();

  genderChart = new Chart(ctx, {
    type: 'bar', 
    data: {
      labels: ['Garçons', 'Filles'],
      datasets: [{
        label: 'Répartition des élèves',
        data: [male, female],
        backgroundColor: ['#4da3ff', '#ff69b4']
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

})();



