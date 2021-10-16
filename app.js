const Feltz = {
    data: () => ({
        dte: 'dte',
        error: [],
        archivo: null,
        registros: [],
        GranTotal: 0
    }),
    methods: {
        cargar (event) {
            this.error = []
            this.registros = []
            
            for (let j = 0; j < event.srcElement.files.length; j++) {
                const archivo = event.srcElement.files[j];
                
                if (archivo.type === 'text/xml') {
                    archivo.text().then( txt => {
                        parser = new DOMParser()
                        xmlDoc = parser.parseFromString(txt, archivo.type)
                        
                        let tipoDoc = xmlDoc.getElementsByTagName(`${this.dte}:SAT`)
                        
                        if (tipoDoc.length > 0 && tipoDoc[0].getAttribute('ClaseDocumento') === 'dte') {
                            let items = xmlDoc.getElementsByTagName(`${this.dte}:Item`)
                            let gen = xmlDoc.getElementsByTagName(`${this.dte}:DatosGenerales`)[0]
                            let emi = xmlDoc.getElementsByTagName(`${this.dte}:Emisor`)[0]
                            let rec = xmlDoc.getElementsByTagName(`${this.dte}:Receptor`)[0]
                            let aut = xmlDoc.getElementsByTagName(`${this.dte}:NumeroAutorizacion`)[0]
                            let fec = new Date(gen.getAttribute('FechaHoraEmision'))
                            let tot = xmlDoc.getElementsByTagName(`${this.dte}:GranTotal`)[0]
                            
                            for (let i = 0; i < items.length; i++) {
                                const element = items[i]
                                this.registros.push({
                                    NombreComercial: emi.getAttribute('NombreComercial'),
                                    NITEmisor: emi.getAttribute('NITEmisor'),
                                    CorreoEmisor: emi.getAttribute('CorreoEmisor'),
                                    AfiliacionIVA: emi.getAttribute('AfiliacionIVA'),
                                    CorreoReceptor: rec.getAttribute('CorreoReceptor'),
                                    IDReceptor: rec.getAttribute('IDReceptor'),
                                    NombreReceptor: rec.getAttribute('NombreReceptor'),
                                    FechaHoraEmision: fec.toLocaleString(),
                                    NumeroAutorizacion: aut.textContent,
                                    Serie: aut.getAttribute('Serie'),
                                    Numero: aut.getAttribute('Numero'),
                                    CodigoMoneda: gen.getAttribute('CodigoMoneda'),
                                    Tipo: gen.getAttribute('Tipo'),
                                    BienOServicio: element.getAttribute('BienOServicio'),
                                    Cantidad: this.valor(element, 'Cantidad'),
                                    UnidadMedida: this.valor(element, 'UnidadMedida'),
                                    Descripcion: this.valor(element, 'Descripcion'),
                                    PrecioUnitario: this.valor(element, 'PrecioUnitario'),
                                    Precio: this.valor(element, 'Precio'),
                                    Descuento: this.valor(element, 'Descuento'),
                                    Total: this.valor(element, 'Total')
                                })
                            }
                        } else {
                            this.error.push({
                                name: archivo.name,
                                error: 'XML incorrecto'
                            })
                        }
                    })
                } else {
                    this.error.push({
                        name: archivo.name,
                        error: 'Tipo de documento no soportado'
                    })
                } 
            }
        },
        valor (item, tag) {
            let node = item.getElementsByTagName(`${this.dte}:${tag}`)[0]
            return node.textContent
        },
        descargar () {
            if (this.registros.length > 0) {
                let compras = document.getElementById('compras')
                let blob = new Blob([compras.innerHTML], {type: 'charset=utf-8; application/vnd.oasis.opendocument.spreadsheet'})
                let url = URL.createObjectURL(blob)

                let hdc = document.createElement('a')
                hdc.href = url
                hdc.download = 'compras.ods'
                hdc.click()
            } else {
                alert('Nada que descargar')
            }
        }
    }
}

Vue.createApp(Feltz).mount('#feltz')