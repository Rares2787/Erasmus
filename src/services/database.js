// ============================================================================
// LER EduShare — Serviciu de Bază de Date (Supabase & Persistent Fallback)
// Liceul Teoretic „Emil Racoviță” Vaslui | Erasmus+ DIGI-EQUAL
// ============================================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isLiveSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('xyzcompany')
);

if (isLiveSupabaseConfigured) {
  console.info('[LER EduShare] Conectat la baza de date cloud Supabase:', SUPABASE_URL);
} else {
  console.warn('[LER EduShare] Supabase neconfigurat, se folosește stocarea locală persistentă.');
}

export const supabase = isLiveSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Chei de stocare locală persistentă
const STORAGE_USERS = 'ler_db_users_v2';
const STORAGE_RESOURCES = 'ler_db_resources_v2';
const STORAGE_REPORTS = 'ler_db_reports_v2';

// Date Preconfigurate Inițiale
const SEED_USERS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'elev@ler.ro',
    password: 'elev123',
    fullName: 'Alexandru Popa',
    role: 'elev',
    classGrade: 'Clasa a XII-a A',
    department: null,
    contactHandle: 'Discord: @alex.ler'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'profesor@ler.ro',
    password: 'prof123',
    fullName: 'Prof. Mihaela Ionescu',
    role: 'profesor',
    classGrade: null,
    department: 'Catedra de Informatică LER',
    contactHandle: 'Teams: mihaela.ionescu@ler.ro'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'admin@ler.ro',
    password: 'admin123',
    fullName: 'Administrator LER',
    role: 'admin',
    classGrade: null,
    department: 'Coordonare Erasmus+ DIGI-EQUAL',
    contactHandle: 'admin@ler.ro'
  }
];

const SEED_RESOURCES = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'Ghid Metodic: Vectori în C++ și Optimizarea Parcurgerilor pentru BAC și OJI',
    subject: 'Informatica (C++)',
    grade: 'Clasa a IX-a',
    type: 'Cod Sursă & Algoritmi',
    authorId: '11111111-1111-1111-1111-111111111111',
    authorName: 'Andrei Popa (Clasa a XII-a A)',
    contactHandle: 'Discord: @andrei.ler',
    status: 'approved',
    isVerified: true,
    verifiedBy: 'Prof. Mihaela Ionescu (Catedra de Informatică LER)',
    teacherComment: 'Cod optim conform standardelor moderne C++, complexitate O(n), formulare didactică riguroasă pentru clasa a IX-a.',
    description: 'Parcurgeri secvențiale, determinare minim/maxim și frecvență de apariție. Atenționări specifice privind indexarea 0..n-1 și evitarea depășirii memoriei alocate.',
    content: `// =====================================================
// LER EduShare - Vectori si Cautare Element Maxim in C++
// Autor: Andrei Popa (Clasa a XII-a A)
// Certificare: Prof. Mihaela Ionescu
// =====================================================
#include <iostream>
using namespace std;

int main() {
    int n, v[1000];
    cout << "Numar elemente: ";
    cin >> n;
    
    // Citire tablou unidimensional
    for(int i = 0; i < n; i++) {
        cin >> v[i];
    }
    
    // Determinare valoare maxima si pozitie asociata
    int maxVal = v[0];
    int pozMax = 0;
    
    for(int i = 1; i < n; i++) {
        if(v[i] > maxVal) {
            maxVal = v[i];
            pozMax = i;
        }
    }
    
    cout << "Maximul identificat: " << maxVal << " la indicele: " << pozMax << endl;
    return 0;
}`,
    link: 'https://github.com/ler-edushare/cpp-vectori-demo',
    createdAt: '2026-10-04'
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    title: 'Algoritmi Fundamentali de Sortare în Python: Bubble, Selection și QuickSort',
    subject: 'Python',
    grade: 'Clasa a X-a',
    type: 'Cod Sursă & Algoritmi',
    authorId: '11111111-1111-1111-1111-111111111111',
    authorName: 'Elena Dumitrescu (Clasa a XI-a B)',
    contactHandle: 'Teams: elena.dumitrescu@ler.ro',
    status: 'approved',
    isVerified: false,
    verifiedBy: null,
    teacherComment: null,
    description: 'Comparație algoritmică între metode O(n^2) și O(n log n). Implementare modulară în Python 3 cu evidențierea recursivității.',
    content: `# =====================================================
# LER EduShare - QuickSort didactic in Python 3
# Autor: Elena Dumitrescu (Clasa a XI-a B)
# Stadiu: In curs de avizare didactica
# =====================================================

def quick_sort(arr):
    """
    Sortare eficienta prin divide et impera.
    Complexitate medie: O(n log n)
    """
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)

# Test didactic
numere = [64, 34, 25, 12, 22, 11, 90]
print("Tablou ordonat:", quick_sort(numere))`,
    link: 'https://github.com/ler-edushare/python-sorting',
    createdAt: '2026-10-05'
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    title: 'Sinteză Bacalaureat: Trigonometrie și Relații Fundamentale pe Cerc',
    subject: 'Matematica',
    grade: 'Clasa a X-a',
    type: 'Scheme Structurale',
    authorId: '11111111-1111-1111-1111-111111111111',
    authorName: 'Radu Vasilescu (Clasa a XII-a M1)',
    contactHandle: 'Discord: @radu.math',
    status: 'approved',
    isVerified: true,
    verifiedBy: 'Prof. Carmen Dumitriu (Catedra de Matematică LER)',
    teacherComment: 'Sinteză completă. Relațiile fundamentale și valorile unghiurilor uzuale sunt structurate conform cerințelor de la proba scrisă.',
    description: 'Centralizator pe o singură pagină cu identitățile trigonometrice frecvent întâlnite la Subiectul I de la examenul de Bacalaureat.',
    content: `========================================================
Sinteza Trigonometrie - Examen Bacalaureat M1/M2
========================================================
1. Relatia fundamentala a trigonometriei:
   sin^2(x) + cos^2(x) = 1  (oricare ar fi x real)

2. Formule de adunare a unghiurilor:
   sin(a + b) = sin(a)cos(b) + cos(a)sin(b)
   sin(a - b) = sin(a)cos(b) - sin(a)sin(b)
   cos(a + b) = cos(a)cos(b) - sin(a)sin(b)
   cos(a - b) = cos(a)cos(b) + sin(a)sin(b)

3. Dublul unghiului:
   sin(2x) = 2*sin(x)*cos(x)
   cos(2x) = cos^2(x) - sin^2(x) = 2*cos^2(x) - 1`,
    link: '',
    createdAt: '2026-10-02'
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    title: 'Ghid introductiv: Grafuri Neorientate și Algoritmul de Parcurgere BFS',
    subject: 'Informatica (C++)',
    grade: 'Clasa a XI-a',
    type: 'Cod Sursă & Algoritmi',
    authorId: '11111111-1111-1111-1111-111111111111',
    authorName: 'Ioana Stanciu (Clasa a XI-a A)',
    contactHandle: 'Discord: @ioana.ler',
    status: 'pending_admin',
    isVerified: false,
    verifiedBy: null,
    teacherComment: null,
    description: 'Construirea matricei de adiacență și explorarea pe niveluri utilizând coada STL.',
    content: `// =====================================================
// BFS pe Graf Neorientat - Coada STL
// Autor: Ioana Stanciu (Clasa a XI-a A)
// [Redirectionat spre Aprobare Administrator]
// =====================================================
#include <iostream>
#include <queue>
using namespace std;

int n, m, a[105][105], viz[105];

void bfs(int nodStart) {
    queue<int> q;
    q.push(nodStart);
    viz[nodStart] = 1;
    
    while(!q.empty()) {
        int nod = q.front();
        q.pop();
        cout << nod << " ";
        
        for(int vecin = 1; vecin <= n; vecin++) {
            if(a[nod][vecin] == 1 && !viz[vecin]) {
                viz[vecin] = 1;
                q.push(vecin);
            }
        }
    }
}`,
    link: 'https://github.com/ler-edushare/grafuri-bfs',
    createdAt: '2026-10-06'
  }
];

const SEED_REPORTS = [
  {
    id: 'rep-1',
    resourceId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    resourceTitle: 'Algoritmi Fundamentali de Sortare în Python',
    authorName: 'Elena Dumitrescu',
    teacherName: 'Prof. Daniel Vasilescu (Informatică LER)',
    targetRecipient: 'admin',
    urgency: 'minor',
    details: 'La prezentarea QuickSort este necesară menționarea degenerării în O(n^2) pe tablouri deja ordonate cu alegere de pivot extrem.',
    status: 'open',
    createdAt: '2026-10-06'
  }
];

function getLocalUsers() {
  const data = localStorage.getItem(STORAGE_USERS);
  if (!data) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(SEED_USERS));
    return [...SEED_USERS];
  }
  return JSON.parse(data);
}

function getLocalResources() {
  const data = localStorage.getItem(STORAGE_RESOURCES);
  if (!data) {
    localStorage.setItem(STORAGE_RESOURCES, JSON.stringify(SEED_RESOURCES));
    return [...SEED_RESOURCES];
  }
  return JSON.parse(data);
}

function getLocalReports() {
  const data = localStorage.getItem(STORAGE_REPORTS);
  if (!data) {
    localStorage.setItem(STORAGE_REPORTS, JSON.stringify(SEED_REPORTS));
    return [...SEED_REPORTS];
  }
  return JSON.parse(data);
}

// API de Bază de Date Unificat
export const db = {
  // Verifică starea backend-ului cloud
  isCloudConnected() {
    return isLiveSupabaseConfigured;
  },

  // --- UTILIZATORI ---
  async authenticateUser(email, password) {
    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email.trim().toLowerCase())
          .eq('password_hash', password)
          .single();
        if (!error && data) {
          return {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            role: data.role,
            classGrade: data.class_grade,
            department: data.department,
            contactHandle: data.contact_handle
          };
        }
      } catch (err) {
        // Fallback la conturile locale
      }
    }

    const users = getLocalUsers();
    const found = users.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!found) return null;
    const { password: _, ...safeUser } = found;
    return safeUser;
  },

  async createUser(userPayload) {
    if (isLiveSupabaseConfigured) {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: userPayload.email.trim().toLowerCase(),
          password_hash: userPayload.password,
          full_name: userPayload.fullName,
          role: userPayload.role,
          class_grade: userPayload.classGrade || null,
          department: userPayload.department || null,
          contact_handle: userPayload.contactHandle || null
        }])
        .select()
        .single();
      if (error) throw error;
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role,
        classGrade: data.class_grade,
        department: data.department,
        contactHandle: data.contact_handle
      };
    }

    const users = getLocalUsers();
    if (users.some(u => u.email.toLowerCase() === userPayload.email.toLowerCase())) {
      throw new Error('Un cont cu această adresă de email există deja.');
    }
    const newUser = {
      id: `usr-${Date.now()}`,
      email: userPayload.email.trim().toLowerCase(),
      password: userPayload.password,
      fullName: userPayload.fullName,
      role: userPayload.role,
      classGrade: userPayload.classGrade || null,
      department: userPayload.department || null,
      contactHandle: userPayload.contactHandle || 'Discord: @elev.ler'
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  },

  // --- RESURSE DIDACTICE ---
  async getResources() {
    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map(r => ({
            id: r.id,
            title: r.title,
            subject: r.subject,
            grade: r.grade,
            type: r.type,
            authorId: r.author_id,
            authorName: r.author_name,
            contactHandle: r.contact_handle,
            status: r.status,
            isVerified: r.is_verified,
            verifiedBy: r.verified_by,
            teacherComment: r.teacher_comment,
            description: r.description,
            content: r.content,
            link: r.link,
            createdAt: r.created_at
          }));
        }
      } catch (err) {
        console.warn('Eroare preluare resurse cloud, se afișează cele locale:', err);
      }
    }

    return getLocalResources();
  },

  async addResource(resource) {
    if (isLiveSupabaseConfigured && supabase) {
      const isUuid = resource.authorId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resource.authorId);
      const { data, error } = await supabase
        .from('resources')
        .insert([{
          title: resource.title,
          subject: resource.subject,
          grade: resource.grade,
          type: resource.type,
          author_id: isUuid ? resource.authorId : null,
          author_name: resource.authorName,
          contact_handle: resource.contactHandle,
          status: 'pending_admin',
          is_verified: false,
          description: resource.description,
          content: resource.content,
          link: resource.link || null
        }])
        .select()
        .single();
      if (error) throw error;
      return {
        id: data.id,
        title: data.title,
        subject: data.subject,
        grade: data.grade,
        type: data.type,
        authorId: data.author_id,
        authorName: data.author_name,
        contactHandle: data.contact_handle,
        status: data.status,
        isVerified: data.is_verified,
        verifiedBy: data.verified_by,
        teacherComment: data.teacher_comment,
        description: data.description,
        content: data.content,
        link: data.link,
        createdAt: data.created_at
      };
    }

    const resources = getLocalResources();
    const newRes = {
      ...resource,
      id: `res-${Date.now()}`,
      status: 'pending_admin',
      isVerified: false,
      verifiedBy: null,
      teacherComment: null,
      createdAt: new Date().toISOString().split('T')[0]
    };
    resources.unshift(newRes);
    localStorage.setItem(STORAGE_RESOURCES, JSON.stringify(resources));
    return newRes;
  },

  async updateResource(id, updates) {
    if (isLiveSupabaseConfigured) {
      const payload = {};
      if ('status' in updates) payload.status = updates.status;
      if ('isVerified' in updates) payload.is_verified = updates.isVerified;
      if ('verifiedBy' in updates) payload.verified_by = updates.verifiedBy;
      if ('teacherComment' in updates) payload.teacher_comment = updates.teacherComment;

      const { data, error } = await supabase
        .from('resources')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return {
        id: data.id,
        title: data.title,
        subject: data.subject,
        grade: data.grade,
        type: data.type,
        authorId: data.author_id,
        authorName: data.author_name,
        contactHandle: data.contact_handle,
        status: data.status,
        isVerified: data.is_verified,
        verifiedBy: data.verified_by,
        teacherComment: data.teacher_comment,
        description: data.description,
        content: data.content,
        link: data.link,
        createdAt: data.created_at
      };
    }

    const resources = getLocalResources();
    const index = resources.findIndex(r => r.id === id);
    if (index !== -1) {
      resources[index] = { ...resources[index], ...updates };
      localStorage.setItem(STORAGE_RESOURCES, JSON.stringify(resources));
      return resources[index];
    }
    return null;
  },

  async deleteResource(id) {
    if (isLiveSupabaseConfigured) {
      const { error } = await supabase.from('resources').delete().eq('id', id);
      if (error) throw error;
      return true;
    }

    let resources = getLocalResources();
    resources = resources.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_RESOURCES, JSON.stringify(resources));
    return true;
  },

  // --- SESIZĂRI PROFESORI ---
  async getReports() {
    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map(rep => ({
            id: rep.id,
            resourceId: rep.resource_id,
            resourceTitle: rep.resource_title,
            teacherName: rep.teacher_name,
            targetRecipient: rep.target_recipient,
            urgency: rep.urgency,
            details: rep.details,
            status: rep.status,
            createdAt: rep.created_at
          }));
        }
      } catch (err) {
        console.warn('Eroare preluare rapoarte cloud:', err);
      }
    }

    return getLocalReports();
  },

  async addReport(report) {
    if (isLiveSupabaseConfigured && supabase) {
      const isUuid = report.resourceId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(report.resourceId);
      const { data, error } = await supabase
        .from('reports')
        .insert([{
          resource_id: isUuid ? report.resourceId : null,
          resource_title: report.resourceTitle,
          teacher_name: report.teacherName,
          target_recipient: report.targetRecipient,
          urgency: report.urgency,
          details: report.details,
          status: 'open'
        }])
        .select()
        .single();
      if (error) throw error;
      return {
        id: data.id,
        resourceId: data.resource_id,
        resourceTitle: data.resource_title,
        teacherName: data.teacher_name,
        targetRecipient: data.target_recipient,
        urgency: data.urgency,
        details: data.details,
        status: data.status,
        createdAt: data.created_at
      };
    }

    const reports = getLocalReports();
    const newReport = {
      ...report,
      id: `rep-${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0]
    };
    reports.unshift(newReport);
    localStorage.setItem(STORAGE_REPORTS, JSON.stringify(reports));
    return newReport;
  },

  async resolveReport(id) {
    if (isLiveSupabaseConfigured) {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'resolved' })
        .eq('id', id);
      if (error) throw error;
      return true;
    }

    const reports = getLocalReports();
    const found = reports.find(r => r.id === id);
    if (found) {
      found.status = 'resolved';
      localStorage.setItem(STORAGE_REPORTS, JSON.stringify(reports));
    }
    return true;
  },

  // Abonare la actualizări live (Realtime)
  subscribeLiveUpdates(onUpdate) {
    if (!isLiveSupabaseConfigured || !supabase) return () => {};

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'resources' },
        () => onUpdate()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        () => onUpdate()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
