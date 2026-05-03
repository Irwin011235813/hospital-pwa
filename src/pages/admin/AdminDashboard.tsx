import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { addDoc, collection, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../lib/firebase';
import { Noticia, NoticiasCard } from '../../components/patient/NoticiasCard';
import AdminNavBar from '../../components/admin/AdminNavBar';
import AdminBottomNav from '../../components/admin/AdminBottomNav';
import { Star, Image as ImageIcon, FileText, Video, X, AlertCircle, CheckCircle2 } from 'lucide-react';

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
	const [expanded, setExpanded] = useState(false);
	const [filterCat, setFilterCat] = useState<NewsCategory | 'Todas'>('Todas');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	const handleLogout = async () => {
		await signOut(auth);
		navigate('/login', { replace: true });
	};

	const handleGoToComposer = () => {
		const el = document.getElementById('composer-novedad');
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'center' });
			setExpanded(true);
		}
	};

	const handleCollapse = () => {
		setExpanded(false);
		setEditingId(null);
		setPostForm({ titulo: '', cuerpo: '', categoria: 'Salud', imagen: '', destacada: false });
		setUploadFile(null);
		setImagePreview(null);
		setPublishError('');
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
			const payload = {
				titulo:    postForm.titulo.trim(),
				cuerpo:    postForm.cuerpo.trim(),
				categoria: postForm.categoria,
				imagen:    imageUrl,
				destacada: postForm.destacada,
			};
			if (editingId) {
				await updateDoc(doc(db, 'noticias', editingId), payload);
			} else {
				await addDoc(collection(db, 'noticias'), {
					...payload,
					autorId:   auth.currentUser?.uid ?? '',
					fecha:     new Date().toISOString(),
					createdAt: serverTimestamp(),
				});
			}
			setPublishSuccess(true);
			setPostForm({ titulo: '', cuerpo: '', categoria: 'Salud', imagen: '', destacada: false });
			setUploadFile(null);
			setImagePreview(null);
			setEditingId(null);
			setTimeout(() => { setPublishSuccess(false); setExpanded(false); }, 1500);
		} catch (err) {
			console.error('[AdminDashboard] publish error', err);
			setPublishError('No se pudo publicar la novedad. Revisá permisos y conexion.');
		} finally {
			setPublishing(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!window.confirm('¿Eliminar esta publicación? Esta acción no se puede deshacer.')) return;
		try {
			await deleteDoc(doc(db, 'noticias', id));
		} catch (err) {
			console.error('[AdminDashboard] delete error', err);
		}
	};

	const handleEdit = (noticia: Noticia) => {
		setEditingId(noticia.id);
		setPostForm({
			titulo:    noticia.titulo,
			cuerpo:    noticia.cuerpo,
			categoria: noticia.categoria as NewsCategory,
			imagen:    noticia.imagen ?? '',
			destacada: noticia.destacada,
		});
		setExpanded(true);
		setImagePreview(null);
		document.getElementById('composer-novedad')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	};

	const catCounts = { Salud: 0, Institucional: 0, Urgente: 0 } as Record<string, number>;
	news.forEach(n => { if (n.categoria in catCounts) catCounts[n.categoria]++; });
	const filteredNews = filterCat === 'Todas' ? news : news.filter(n => n.categoria === filterCat);

	return (
		<div>
			<AdminNavBar onLogout={handleLogout} />
			<div className="page-content space-y-4 pb-24">
				{/* Composer ancla */}
				<div id="composer-novedad" />

				{/* Composer estilo Facebook */}
				<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

					{/* Fila superior: avatar + pill */}
					<div className="flex items-center gap-3 px-4 pt-4 pb-3">
						<div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-white text-sm font-bold shrink-0">
							{auth.currentUser?.displayName?.charAt(0)?.toUpperCase() ?? 'A'}
						</div>
						<button
							onClick={() => setExpanded(true)}
							className="flex-1 text-left bg-slate-100 hover:bg-slate-200 transition-colors rounded-full px-4 py-2.5 text-sm text-slate-500"
						>
							Crear publicación
						</button>
						{expanded && (
							<button
								onClick={handleCollapse}
								className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
							>
								<X size={16} className="text-slate-500" />
							</button>
						)}
					</div>

					{/* Divider */}
					<div className="border-t border-slate-100" />

					{/* Formulario expandido */}
					{expanded && (
						<div className="px-4 py-4 space-y-3">
							{publishError && (
								<div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
									<AlertCircle size={14} /> {publishError}
								</div>
							)}
							{publishSuccess && (
								<div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-sm text-emerald-700">
									<CheckCircle2 size={14} /> Novedad publicada correctamente.
								</div>
							)}

							<input
								value={postForm.titulo}
								onChange={(e) => setPostForm(f => ({ ...f, titulo: e.target.value }))}
								placeholder="Título de la novedad"
								className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
							/>

							<textarea
								value={postForm.cuerpo}
								onChange={(e) => setPostForm(f => ({ ...f, cuerpo: e.target.value }))}
								placeholder="¿Qué querés compartir con los pacientes?"
								rows={4}
								className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
							/>

{/* Preview imagen */}
					{imagePreview && (
						<div className="relative rounded-xl overflow-hidden border border-slate-200">
							<img src={imagePreview} alt="preview" className="w-full h-40 object-cover" />
							<button
								onClick={() => { setUploadFile(null); setImagePreview(null); }}
								className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-colors"
							>
								<X size={14} className="text-white" />
							</button>
						</div>
					)}
					{uploadFile && !imagePreview && (
						<div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700">
							<ImageIcon size={14} />
							<span className="truncate flex-1">{uploadFile.name}</span>
							<button onClick={() => setUploadFile(null)}><X size={14} /></button>
								</div>
							)}

							<div className="flex gap-2">
								<select
									value={postForm.categoria}
									onChange={(e) => setPostForm(f => ({ ...f, categoria: e.target.value as NewsCategory }))}
									className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
								>
									<option value="Salud">Salud</option>
									<option value="Institucional">Institucional</option>
									<option value="Urgente">Urgente</option>
								</select>

								<button
									type="button"
									onClick={() => setPostForm(f => ({ ...f, destacada: !f.destacada }))}
									className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${postForm.destacada ? 'border-blue-700 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'}`}
								>
									<Star size={15} className={postForm.destacada ? 'text-blue-700 fill-blue-700' : 'text-slate-400'} />
									Destacada
								</button>
							</div>

							{/* Input file oculto */}
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								className="hidden"
								onChange={(e) => {
									const f = e.target.files?.[0] ?? null;
									setUploadFile(f);
									setImagePreview(f ? URL.createObjectURL(f) : null);
								}}
							/>

							<button
								onClick={handlePublish}
								disabled={publishing || !postForm.titulo.trim() || !postForm.cuerpo.trim()}
								className="w-full rounded-xl bg-blue-800 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:opacity-40"
							>
								{publishing ? (editingId ? 'Guardando...' : 'Publicando...') : (editingId ? 'Guardar cambios' : 'Publicar')}
							</button>
						</div>
					)}

					{/* Botones de acción inferiores (siempre visibles) */}
					{!expanded && (
						<div className="flex items-center divide-x divide-slate-100 px-2 py-1">
							<button
								onClick={() => setExpanded(true)}
								className="flex flex-1 items-center justify-center gap-2 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-600"
							>
								<Video size={18} className="text-green-600" />
								Vídeo
							</button>
							<button
								onClick={() => { setExpanded(true); setTimeout(() => fileInputRef.current?.click(), 100); }}
								className="flex flex-1 items-center justify-center gap-2 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-600"
							>
								<ImageIcon size={18} className="text-blue-500" />
								Foto
							</button>
							<button
								onClick={() => setExpanded(true)}
								className="flex flex-1 items-center justify-center gap-2 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-600 whitespace-nowrap"
							>
								<FileText size={18} className="text-orange-600" />
								Artículo
							</button>
						</div>
					)}
				</div>

				{/* Feed de novedades */}
				<div className="space-y-4">
					<div className="flex flex-col gap-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-base font-bold text-slate-900">Feed de novedades</p>
								<p className="text-sm text-slate-500">Las últimas noticias que verá el paciente.</p>
							</div>
						</div>
						{/* Chips contador + filtro */}
						<div className="flex flex-wrap gap-2">
							{(['Todas', 'Salud', 'Institucional', 'Urgente'] as const).map(cat => {
								const count = cat === 'Todas' ? news.length : (catCounts[cat] ?? 0);
								return (
									<button
										key={cat}
										onClick={() => setFilterCat(cat)}
										className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all border ${
											filterCat === cat
												? 'bg-blue-800 text-white border-blue-800'
												: 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
										}`}
									>
										{cat}
										<span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
											filterCat === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
										}`}>{count}</span>
									</button>
								);
							})}
						</div>
					</div>
					{filteredNews.length === 0 ? (
						<div className="card text-center py-10 text-slate-500">
							{news.length === 0 ? 'No hay novedades publicadas aún.' : 'No hay publicaciones en esta categoría.'}
						</div>
					) : (
						<div className="grid gap-4">
							{filteredNews.map(n => (
								<NoticiasCard
									key={n.id}
									noticia={n}
									onEdit={() => handleEdit(n)}
									onDelete={() => handleDelete(n.id)}
								/>
							))}
						</div>
					)}
				</div>
			</div>
			<AdminBottomNav onPublicar={handleGoToComposer} />
		</div>
	);
}
