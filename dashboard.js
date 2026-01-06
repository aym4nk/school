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
  const Classes  = store('classes');
  const Notes    = store('notes');

  /* =========================
     NAVIGATION
  ========================= */
  [
    ['#nav-home', '#panel-home'],
    ['#nav-students', '#panel-students'],
    ['#nav-subjects', '#panel-subjects'],
    ['#nav-teachers', '#panel-teachers'],
    ['#nav-classes', '#panel-classes'],
    ['#nav-notes', '#panel-notes']
  ].forEach(([btn, panel]) => {
    const b = $(btn);
    if (!b) return;
    b.onclick = () => {
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(x => x.classList.remove('active'));
      $(panel).classList.add('active');
      b.classList.add('active');
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
  const classes  = Classes.get();
  const notes    = Notes.get();

  $('#count-students').textContent = students.length;
  $('#count-subjects').textContent = subjects.length;
  $('#count-teachers').textContent = teachers.length;
  $('#count-classes').textContent  = classes.length;
  $('#count-notes').textContent    = notes.length;

  renderMainChart(
    students.length,
    subjects.length,
    teachers.length,
    classes.length,
    notes.length
  );

  renderGenderChart(students);
}


  function renderMainChart(a, b, c, d, e) {
    const ctx = $('#dashboardChart');
    if (!ctx) return;
    if (mainChart) mainChart.destroy();

    mainChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Élèves', 'Matières', 'Professeurs', 'Classes', 'Notes'],
        datasets: [{
          data: [a, b, c, d, e],
          backgroundColor: ['#4da3ff', '#a30023', '#5cd65c', '#ffcc00', '#ff8533']
        }]
      },
      options: {
        cutout: '60%',
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  function renderGenderChart(students) {
    const ctx = $('#genderChart');
    if (!ctx) return;
    if (genderChart) genderChart.destroy();

    let male = 0, female = 0;
    students.forEach(s => {
      if (!s.sexe) return;
      const v = s.sexe.toLowerCase();
      if (v === 'male' || v === 'homme') male++;
      if (v === 'female' || v === 'femme') female++;
    });

    genderChart = new Chart(ctx, {
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
          renderStudents(); renderStats();
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
          renderSubjects(); renderStats();
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
          renderTeachers(); renderStats();
        }
      }
    );
  }

  /* =========================
     CLASSES
  ========================= */
  function classFormInit() {
    const f = $('#classForm');
    if (!f) return;
    f.onsubmit = e => {
      e.preventDefault();
      const data = { name: f.name.value };
      f.id.value ? Classes.update(f.id.value, data) : Classes.add(data);
      f.reset(); f.id.value = '';
      renderClasses();
    };
  }

  function renderClasses() {
    const tb = $('#classesTable tbody');
    if (!tb) return;
    tb.innerHTML = '';
    Classes.get().forEach(c => {
      tb.innerHTML += `
        <tr>
          <td>${c.name}</td>
          <td>
            <button data-edit="${c.id}">Modifier</button>
            <button data-del="${c.id}">Supprimer</button>
          </td>
        </tr>`;
    });

    tb.querySelectorAll('[data-edit]').forEach(b =>
      b.onclick = () => {
        const c = Classes.find(b.dataset.edit);
        const f = $('#classForm');
        f.id.value = c.id;
        f.name.value = c.name;
      }
    );

    tb.querySelectorAll('[data-del]').forEach(b =>
      b.onclick = () => {
        if (confirm('Supprimer cette classe ?')) {
          Classes.remove(b.dataset.del);
          renderClasses();
        }
      }
    );
  }

  /* =========================
     NOTES
  ========================= */
  function noteFormInit() {
    const f = $('#noteForm');
    if (!f) return;
    f.onsubmit = e => {
      e.preventDefault();
      const data = {
        student: f.student.value,
        subject: f.subject.value,
        value: f.value.value
      };
      f.id.value ? Notes.update(f.id.value, data) : Notes.add(data);
      f.reset(); f.id.value = '';
      renderNotes();
    };
  }

  function renderNotes() {
    const tb = $('#notesTable tbody');
    if (!tb) return;
    tb.innerHTML = '';
    Notes.get().forEach(n => {
      tb.innerHTML += `
        <tr>
          <td>${n.student}</td>
          <td>${n.subject}</td>
          <td>${n.value}</td>
          <td>
            <button data-edit="${n.id}">Modifier</button>
            <button data-del="${n.id}">Supprimer</button>
          </td>
        </tr>`;
    });

    tb.querySelectorAll('[data-edit]').forEach(b =>
      b.onclick = () => {
        const n = Notes.find(b.dataset.edit);
        const f = $('#noteForm');
        f.id.value = n.id;
        f.student.value = n.student;
        f.subject.value = n.subject;
        f.value.value = n.value;
      }
    );

    tb.querySelectorAll('[data-del]').forEach(b =>
      b.onclick = () => {
        if (confirm('Supprimer cette note ?')) {
          Notes.remove(b.dataset.del);
          renderNotes();
        }
      }
    );
  }

  /* =========================
     LOGOUT
  ========================= */
  function setupLogout() {
    $('#logoutBtn').onclick = () => {
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
    classFormInit();
    noteFormInit();

    renderStudents();
    renderSubjects();
    renderTeachers();
    renderClasses();
    renderNotes();
    renderStats();

    setupLogout();
  });

})();
