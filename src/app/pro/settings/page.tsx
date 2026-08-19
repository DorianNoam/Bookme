async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Verification format : on refuse ce qui n'est pas une image (ex: HEIC iPhone souvent non reconnu)
    if (!file.type.startsWith('image/')) {
      setUploadMsg('Erreur : format non supporte. Utilisez une photo JPG ou PNG. Si vous etes sur iPhone, changez le format des photos en "Le plus compatible" (Reglages > Appareil photo > Formats).')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // Verification taille
    if (file.size > 5 * 1024 * 1024) {
      const tailleMo = (file.size / (1024 * 1024)).toFixed(1)
      setUploadMsg(`Erreur : image trop lourde (${tailleMo} Mo). Le maximum est 5 Mo. Reduisez la taille de la photo puis reessayez.`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setUploading(true)
    setUploadMsg('')

    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `salon-${salon.id}-${Date.now()}.${ext}`

      // 1. Envoi dans Supabase Storage
      const { error: uploadError } = await supabaseClient.storage
        .from('salon-images')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        // On affiche la vraie erreur du storage (permissions, bucket, etc.)
        setUploadMsg('Erreur upload : ' + uploadError.message)
        setUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      // 2. Recuperation de l'URL publique
      const { data: urlData } = supabaseClient.storage.from('salon-images').getPublicUrl(fileName)
      const publicUrl = urlData.publicUrl

      // 3. Enregistrement de l'URL en base (PATCH)
      const res = await fetch('/api/pro/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, image: publicUrl })
      })
      const data = await res.json()

      if (data.success) {
        setForm({ ...form, image: publicUrl })
        onUpdate({ ...form, image: publicUrl })
        setUploadMsg('Photo mise a jour !')
      } else {
        // AVANT : rien ne s'affichait ici (bug muet). Maintenant on montre la vraie cause.
        setUploadMsg('Erreur enregistrement : ' + (data.error || 'echec inconnu du serveur'))
      }
    } catch (err: any) {
      setUploadMsg('Erreur : ' + (err.message || 'Upload echoue'))
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
