(function () {
  'use strict';

  const $ = s => document.querySelector(s);

  /* =========================
     STORAGE
  ========================= */
  function store(key) {
    return {
      get: () => JSON.parse(localStorage.getItem(key) || '[]'),
      save: d => localStorage.setItem(key, JSON.stringify(d)),
      add(item) {
        item.id = Date.now().toString();
        const d = this.get();
        d.push(item);
        this.save(d);
      },
      update(id, patch) {
        const d = this.get();
        const i = d.findIndex(x => x.id === id);
        if (i !== -1) {
          d[i] = { ...d[i], ...patch };
          this.save(d);
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
  [
    ['#nav-home', '#panel-home'],
    ['#nav-students', '#panel-students'],
    ['#nav-subjects', '#panel-subjects'],
    ['#nav-teachers', '#panel-teachers']
  ].forEach(([btn, panel]) => {
    $(btn).onclick = () => {
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      $(panel).classList.add('active');
      $(btn).classList.add('active');
      if (panel === '#panel-home') setTimeout(renderStats, 50);
    };
  });

  /* =========================
     STATS + CHARTS
  ========================= */
  let mainChart = null;
  let genderChart = null;

  function renderStats() {
    const students = Students.get();
    const subjects = Subjects.get();
    const teachers = Teachers.get();

    $('#count-students').textContent = students.length;
    $('#count-subjects').textContent = subjects.length;
    $('#count-teachers').textContent = teachers.length;

    renderMainChart(students.length, subjects.length, teachers.length);
    renderGenderChart(students);
  }

  function renderMainChart(students, subjects, teachers) {
    const c = $('#dashboardChart');
    if (!c) return;
    if (mainChart) mainChart.destroy();

    mainChart = new Chart(c, {
      type: 'doughnut',
      data: {
        labels: ['Élèves', 'Matières', 'Professeurs'],
        datasets: [{
          data: [students, subjects, teachers],
          backgroundColor: ['#4da3ff', '#a30023', '#5cd65c']
        }]
      },
      options: {
        cutout: '60%',
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  function renderGenderChart(students) {
    const c = $('#genderChart');
    if (!c) return;
    if (genderChart) genderChart.destroy();

    let male = 0, female = 0;
    students.forEach(s => {
      if (!s.sexe) return;
      const x = s.sexe.toLowerCase();
      if (x === 'male' || x === 'homme') male++;
      if (x === 'female' || x === 'femme') female++;
    });

    genderChart = new Chart(c, {
      type: 'bar',
      data: {
        labels: ['Garçons', 'Filles'],
        datasets: [{
          data: [male, female],
          backgroundColor: ['#4da3ff', '#ff69b4']
        }]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });
  }

  /* =========================
     STUDENTS
  ========================= */
  function studentFormInit() {
    const f = $('#studentForm');
    f.onsubmit = e => {
      e.preventDefault();
      const data = {
        name: f.name.value,
        sexe: f.sexe.value,
        classroom: f.classroom.value
      };
      f.id.value ? Students.update(f.id.value, data) : Students.add(data);
      f.reset(); f.id.value = '';
      renderStudents(); renderStats();
    };
  }

  function renderStudents() {
    const tb = $('#studentsTable tbody');
    tb.innerHTML = '';
    Students.get().forEach(s => {
      tb.innerHTML += `
        <tr>
          <td>${s.name}</td>
          <td>${s.sexe}</td>
          <td>${s.classroom}</td>
          <td>
            <button data-edit="${s.id}">Modifier</button>
            <button data-del="${s.id}">Supprimer</button>
          </td>
        </tr>`;
    });

    tb.querySelectorAll('[data-edit]').forEach(b =>
      b.onclick = () => {
        const s = Students.find(b.dataset.edit);
        const f = $('#studentForm');
        f.id.value = s.id;
        f.name.value = s.name;
        f.sexe.value = s.sexe;
        f.classroom.value = s.classroom;
      }
    );

    tb.querySelectorAll('[data-del]').forEach(b =>
      b.onclick = () => {
        if (confirm('Supprimer cet élève ?')) {
          Students.remove(b.dataset.del);
          renderStudents();
          renderStats();
        }
      }
    );
  }

  /* =========================
     SUBJECTS
  ========================= */
  function subjectFormInit() {
    const f = $('#subjectForm');
    f.onsubmit = e => {
      e.preventDefault();
      const data = { name: f.name.value, code: f.code.value };
      f.id.value ? Subjects.update(f.id.value, data) : Subjects.add(data);
      f.reset(); f.id.value = '';
      renderSubjects(); renderStats();
    };
  }

  function renderSubjects() {
    const tb = $('#subjectsTable tbody');
    tb.innerHTML = '';
    Subjects.get().forEach(s => {
      tb.innerHTML += `
        <tr>
          <td>${s.name}</td>
          <td>${s.code}</td>
          <td>
            <button data-edit="${s.id}">Modifier</button>
            <button data-del="${s.id}">Supprimer</button>
          </td>
        </tr>`;
    });

    tb.querySelectorAll('[data-edit]').forEach(b =>
      b.onclick = () => {
        const s = Subjects.find(b.dataset.edit);
        const f = $('#subjectForm');
        f.id.value = s.id;
        f.name.value = s.name;
        f.code.value = s.code;
      }
    );

    tb.querySelectorAll('[data-del]').forEach(b =>
      b.onclick = () => {
        if (confirm('Supprimer cette matière ?')) {
          Subjects.remove(b.dataset.del);
          renderSubjects();
          renderStats();
        }
      }
    );
  }

  /* =========================
     TEACHERS
  ========================= */
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
      f.reset(); f.id.value = '';
      renderTeachers(); renderStats();
    };
  }

  function renderTeachers() {
    const tb = $('#teachersTable tbody');
    tb.innerHTML = '';
    Teachers.get().forEach(t => {
      tb.innerHTML += `
        <tr>
          <td>${t.name}</td>
          <td>${t.email}</td>
          <td>${t.subject}</td>
          <td>
            <button data-edit="${t.id}">Modifier</button>
            <button data-del="${t.id}">Supprimer</button>
          </td>
        </tr>`;
    });

    tb.querySelectorAll('[data-edit]').forEach(b =>
      b.onclick = () => {
        const t = Teachers.find(b.dataset.edit);
        const f = $('#teacherForm');
        f.id.value = t.id;
        f.name.value = t.name;
        f.email.value = t.email;
        f.subject.value = t.subject;
      }
    );

    tb.querySelectorAll('[data-del]').forEach(b =>
      b.onclick = () => {
        if (confirm('Supprimer ce professeur ?')) {
          Teachers.remove(b.dataset.del);
          renderTeachers();
          renderStats();
        }
      }
    );
  }

  /* =========================
     LOGOUT
  ========================= */
  function setupLogout() {
    const btn = $('#logoutBtn');
    if (!btn) return;
    btn.onclick = () => {
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    };
  }

  /* =========================
     INIT
  ========================= */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    $('#panel-home').classList.add('active');
    $('#nav-home').classList.add('active');

    studentFormInit();
    subjectFormInit();
    teacherFormInit();

    renderStudents();
    renderSubjects();
    renderTeachers();
    renderStats();

    setupLogout();
  });

})();
