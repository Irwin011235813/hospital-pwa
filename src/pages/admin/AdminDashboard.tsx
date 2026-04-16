import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { addDoc, collection, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../lib/firebase';
import { Noticia, NoticiasCard } from '../../components/patient/NoticiasCard';
import AdminNavBar from '../../components/admin/AdminNavBar';
import { Star } from 'lucide-react';

type NewsCategory = 'Salud' | 'Institucional' | 'Urgente';


export default function AdminDashboard() {
	const [news, setNews] = useState<Noticia[]>([]);
	const [postForm, setPostForm] = useState({
		titulo: '',
		cuerpo: '',
		categoria: 'Salud' as NewsCategory,
		imagen: '',
		destacada: false,
	});
	const [uploadFile, setUploadFile] = useState<File | null>(null);
	const [publishing, setPublishing] = useState(false);
	const [publishError, setPublishError] = useState('');
	const [publishSuccess, setPublishSuccess] = useState(false);
	const navigate = useNavigate();

	const handleLogout = async () => {
		await signOut(auth);
		navigate('/login', { replace: true });
	};

	const handleGoToComposer = () => {
		const el = document.getElementById('composer-novedad');
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	};

	useEffect(() => {
		const q = query(collection(db, 'noticias'), orderBy('fecha', 'desc'));
		const unsub = onSnapshot(q, snap => {
			setNews(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Noticia)));
		});
		return () => unsub();
	}, []);

	const handlePublish = async () => {
		if (!postForm.titulo.trim() || !postForm.cuerpo.trim()) {
			setPublishError('El titulo y el contenido son obligatorios.');
			return;
		}
		setPublishError('');
		setPublishing(true);
		try {
			let imageUrl = postForm.imagen;
			if (uploadFile) {
				const fileRef = ref(storage, `noticias/${Date.now()}_${uploadFile.name}`);
				await uploadBytes(fileRef, uploadFile);
				imageUrl = await getDownloadURL(fileRef);
			}
			await addDoc(collection(db, 'noticias'), {
				titulo:    postForm.titulo.trim(),
				cuerpo:    postForm.cuerpo.trim(),
				categoria: postForm.categoria,
				imagen:    imageUrl,
				destacada: postForm.destacada,
				autorId:   auth.currentUser?.uid ?? '',
				fecha:     new Date().toISOString(),
				createdAt: serverTimestamp(),
			});
			setPublishSuccess(true);
			setPostForm({ titulo: '', cuerpo: '', categoria: 'Salud', imagen: '', destacada: false });
			setUploadFile(null);
			setTimeout(() => setPublishSuccess(false), 2500);
		} catch (err) {
			console.error('[AdminDashboard] publish error', err);
			setPublishError('No se pudo publicar la novedad. Revisá permisos y conexion.');
		} finally {
			setPublishing(false);
		}
	};

	return (
		<div>
			<AdminNavBar onLogout={handleLogout} onGoToComposer={handleGoToComposer} />
			<div className="page-content space-y-4">
				{/* Composer de novedades (ancla para scroll) */}
				<div id="composer-novedad"></div>

				{/* Composer estilo Facebook */}
				<div className="card-md bg-white border border-slate-200 shadow-sm">
					<div className="flex flex-col gap-4 px-4 py-4">
						<div className="flex items-center gap-3">
							<div className="w-11 h-11 rounded-full bg-blue-800 flex items-center justify-center text-white text-sm font-bold">
								{auth.currentUser?.displayName?.charAt(0) ?? 'A'}
							</div>
							<div>
								<p className="text-sm font-semibold text-slate-900">Publicá una novedad</p>
								<p className="text-xs text-slate-500">Comparte información importante con los pacientes.</p>
							</div>
						</div>
						{publishError ? (
							<div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
								{publishError}
							</div>
						) : publishSuccess ? (
							<div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
								Novedad publicada correctamente.
							</div>
						) : null}
						<div className="grid gap-3 md:grid-cols-3">
							<input
								value={postForm.titulo}
								onChange={(e) => setPostForm(f => ({ ...f, titulo: e.target.value }))}
								placeholder="Titulo"
								className="md:col-span-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
							/>
							<textarea
								value={postForm.cuerpo}
								onChange={(e) => setPostForm(f => ({ ...f, cuerpo: e.target.value }))}
								placeholder="¿Qué querés compartir hoy?"
								rows={3}
								className="md:col-span-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
							/>
							<select
								value={postForm.categoria}
								onChange={(e) => setPostForm(f => ({ ...f, categoria: e.target.value as NewsCategory }))}
								className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
							>
								<option value="Salud">Salud</option>
								<option value="Institucional">Institucional</option>
								<option value="Urgente">Urgente</option>
							</select>
							<label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:border-blue-300">
								<input
									type="file"
									accept="image/*"
									onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
									className="hidden"
								/>
								<span>{uploadFile ? uploadFile.name : 'Subir imagen'}</span>
							</label>
							<button
								type="button"
								onClick={() => setPostForm(f => ({ ...f, destacada: !f.destacada }))}
								className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${postForm.destacada ? 'border-blue-700 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'}`}
							>
								<Star size={16} className={postForm.destacada ? 'text-blue-700' : 'text-slate-400'} />
								{postForm.destacada ? 'Destacada' : 'Marcar destacada'}
							</button>
							<button
								type="button"
								onClick={handlePublish}
								disabled={publishing}
								className="md:col-span-3 rounded-2xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
							>
								{publishing ? 'Publicando...' : 'Publicar novedad'}
							</button>
						</div>
					</div>
				</div>

				{/* Feed de novedades */}
				<div className="space-y-4">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="text-base font-bold text-slate-900">Feed de novedades</p>
							<p className="text-sm text-slate-500">Las últimas noticias que verá el paciente.</p>
						</div>
						<span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
							{news.length} publicaciones
						</span>
					</div>
					{news.length === 0 ? (
						<div className="card text-center py-10 text-slate-500">
							No hay novedades publicadas aún.
						</div>
					) : (
						<div className="grid gap-4">
							{news.map(n => (
								<NoticiasCard key={n.id} noticia={n} />
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
