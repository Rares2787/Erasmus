-- ============================================================================
-- LER EduShare — Date Inițiale (Seed)
-- Rulează în Supabase → SQL Editor → New query → Run
-- ============================================================================

-- Conturi utilizatori
INSERT INTO users (id, email, password_hash, full_name, role, class_grade, department, contact_handle)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'elev@ler.ro', 'elev123', 'Alexandru Popa', 'elev', 'Clasa a XII-a A', NULL, 'Discord: @alex.ler'),
    ('22222222-2222-2222-2222-222222222222', 'profesor@ler.ro', 'prof123', 'Prof. Mihaela Ionescu', 'profesor', NULL, 'Catedra de Informatică LER', 'Teams: mihaela.ionescu@ler.ro'),
    ('33333333-3333-3333-3333-333333333333', 'admin@ler.ro', 'admin123', 'Administrator LER', 'admin', NULL, 'Coordonare Erasmus+ DIGI-EQUAL', 'admin@ler.ro')
ON CONFLICT (email) DO NOTHING;

-- Resurse inițiale
INSERT INTO resources (id, title, subject, grade, type, author_id, author_name, contact_handle, status, is_verified, verified_by, teacher_comment, description, content, link)
VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Ghid Metodic: Vectori în C++ și Optimizarea Parcurgerilor pentru BAC și OJI',
        'Informatica (C++)',
        'Clasa a IX-a',
        'Cod Sursă & Algoritmi',
        '11111111-1111-1111-1111-111111111111',
        'Andrei Popa (Clasa a XII-a A)',
        'Discord: @andrei.ler',
        'approved',
        TRUE,
        'Prof. Mihaela Ionescu (Catedra de Informatică LER)',
        'Cod optim conform standardelor C++, complexitate O(n), formulare didactică riguroasă pentru clasa a IX-a.',
        'Parcurgeri secvențiale, determinare minim/maxim și frecvență. Atenționări specifice privind indexarea de la 0 la n-1.',
        '#include <iostream>
using namespace std;
int main() {
    int n, v[1000];
    cin >> n;
    for(int i = 0; i < n; i++) cin >> v[i];
    int maxVal = v[0], pozMax = 0;
    for(int i = 1; i < n; i++) {
        if(v[i] > maxVal) {
            maxVal = v[i];
            pozMax = i;
        }
    }
    cout << "Maxim: " << maxVal << " la poz: " << pozMax;
    return 0;
}',
        'https://github.com/ler-edushare/cpp-vectori-demo'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Algoritmi Fundamentali de Sortare în Python: Bubble, Selection și QuickSort',
        'Python',
        'Clasa a X-a',
        'Cod Sursă & Algoritmi',
        '11111111-1111-1111-1111-111111111111',
        'Elena Dumitrescu (Clasa a XI-a B)',
        'Teams: elena.dumitrescu@ler.ro',
        'approved',
        FALSE,
        NULL,
        NULL,
        'Comparație algoritmică între metode O(n^2) și O(n log n). Implementare modulară în Python 3.',
        'def quick_sort(arr):
    if len(arr) <= 1: return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    mid = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + mid + quick_sort(right)

print("Sortat:", quick_sort([64, 34, 25, 12, 22]))',
        'https://github.com/ler-edushare/python-sorting'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'Ghid introductiv: Grafuri Neorientate și Algoritmul de Parcurgere BFS',
        'Informatica (C++)',
        'Clasa a XI-a',
        'Cod Sursă & Algoritmi',
        '11111111-1111-1111-1111-111111111111',
        'Ioana Stanciu (Clasa a XI-a A)',
        'Discord: @ioana.ler',
        'pending_admin',
        FALSE,
        NULL,
        NULL,
        'Construirea matricei de adiacență și explorarea pe niveluri utilizând coada STL.',
        '#include <iostream>
#include <queue>
using namespace std;
int n, m, a[100][100], viz[100];
// Algoritm BFS in asteptare aprobare administrator',
        'https://github.com/ler-edushare/grafuri-bfs'
    )
ON CONFLICT (id) DO NOTHING;
