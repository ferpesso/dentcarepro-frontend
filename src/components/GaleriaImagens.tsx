import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Image as ImageIcon, Sparkles, Eye, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface GaleriaImagensProps {
  utenteId: number;
}

const TIPOS_IMAGEM = [
  { value: "radiografia_periapical", label: "Radiografia Periapical" },
  { value: "radiografia_panoramica", label: "Radiografia Panorâmica" },
  { value: "radiografia_bite_wing", label: "Radiografia Bite-Wing" },
  { value: "foto_intraoral", label: "Foto Intraoral" },
  { value: "foto_extraoral", label: "Foto Extraoral" },
  { value: "tomografia", label: "Tomografia (CBCT)" },
  { value: "modelo_3d", label: "Modelo 3D" },
  { value: "outro", label: "Outro" },
];

export function GaleriaImagens({ utenteId }: GaleriaImagensProps) {
  const [dialogUploadAberto, setDialogUploadAberto] = useState(false);
  const [dialogVisualizacaoAberto, setDialogVisualizacaoAberto] = useState(false);
  const [imagemSelecionada, setImagemSelecionada] = useState<any>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  // Estados do formulário de upload
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    tipo: "foto_intraoral",
    titulo: "",
    descricao: "",
    denteRelacionado: "",
    analisarComIA: true,
  });

  // Queries
  const { data: imagens, isLoading, refetch } = trpc.imagens.listar.useQuery({
    utenteId,
    tipo: filtroTipo === "todos" ? undefined : filtroTipo,
  });

  const { data: estatisticas } = trpc.imagens.estatisticas.useQuery({ utenteId });

  // Mutations
  const uploadMutation = trpc.imagens.upload.useMutation({
    onSuccess: () => {
      toast.success("Imagem enviada com sucesso!");
      setDialogUploadAberto(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao enviar imagem: ${error.message}`);
    },
  });

  const analisarMutation = trpc.imagens.analisarComIA.useMutation({
    onSuccess: (data) => {
      toast.success("Análise por IA concluída!");
      setImagemSelecionada((prev: any) => ({
        ...prev,
        analisadoPorIA: true,
        resultadoIA: data.resultadoIA,
      }));
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro na análise: ${error.message}`);
    },
  });

  const excluirMutation = trpc.imagens.excluir.useMutation({
    onSuccess: () => {
      toast.success("Imagem excluída!");
      setDialogVisualizacaoAberto(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  // Handlers
  const handleArquivoSelecionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    // Validar tipo
    if (!arquivo.type.startsWith("image/")) {
      toast.error("Por favor, selecione um arquivo de imagem");
      return;
    }

    // Validar tamanho (max 10MB)
    if (arquivo.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 10MB");
      return;
    }

    setArquivoSelecionado(arquivo);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(arquivo);
  };

  const handleUpload = async () => {
    if (!arquivoSelecionado || !previewUrl) {
      toast.error("Selecione uma imagem");
      return;
    }

    uploadMutation.mutate({
      utenteId,
      tipo: formData.tipo,
      titulo: formData.titulo,
      descricao: formData.descricao,
      imagemBase64: previewUrl,
      denteRelacionado: formData.denteRelacionado ? parseInt(formData.denteRelacionado) : undefined,
      analisarComIA: formData.analisarComIA,
    });
  };

  const resetForm = () => {
    setArquivoSelecionado(null);
    setPreviewUrl("");
    setFormData({
      tipo: "foto_intraoral",
      titulo: "",
      descricao: "",
      denteRelacionado: "",
      analisarComIA: true,
    });
  };

  const handleVisualizarImagem = (imagem: any) => {
    setImagemSelecionada(imagem);
    setDialogVisualizacaoAberto(true);
  };

  const handleAnalisarComIA = () => {
    if (!imagemSelecionada) return;
    analisarMutation.mutate({ imagemId: imagemSelecionada.id });
  };

  const handleExcluir = () => {
    if (!imagemSelecionada) return;
    if (confirm("Tem certeza que deseja excluir esta imagem?")) {
      excluirMutation.mutate({ id: imagemSelecionada.id });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Imagens e Radiografias</CardTitle>
            {estatisticas && (
              <p className="text-sm text-muted-foreground mt-1">
                {estatisticas.total} imagens • {estatisticas.analisadasIA} analisadas por IA
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {TIPOS_IMAGEM.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setDialogUploadAberto(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando imagens...
          </div>
        ) : !imagens || imagens.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma imagem encontrada</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setDialogUploadAberto(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Enviar primeira imagem
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imagens.map((imagem) => (
              <div
                key={imagem.id}
                className="relative group cursor-pointer rounded-lg overflow-hidden border hover:border-primary transition-colors"
                onClick={() => handleVisualizarImagem(imagem)}
              >
                <img
                  src={imagem.urlThumbnail || imagem.urlImagem}
                  alt={imagem.titulo || "Imagem"}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                {imagem.analisadoPorIA && (
                  <Badge className="absolute top-2 right-2 bg-purple-500">
                    <Sparkles className="h-3 w-3 mr-1" />
                    IA
                  </Badge>
                )}
                <div className="p-2 bg-white">
                  <p className="text-sm font-medium truncate">
                    {imagem.titulo || TIPOS_IMAGEM.find((t) => t.value === imagem.tipo)?.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(imagem.dataUpload).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Dialog de Upload */}
      <Dialog open={dialogUploadAberto} onOpenChange={setDialogUploadAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enviar Nova Imagem</DialogTitle>
            <DialogDescription>
              Adicione radiografias, fotos intraorais ou outros tipos de imagens
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Seleção de arquivo */}
            <div>
              <Label>Selecionar Imagem *</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleArquivoSelecionado}
                className="mt-1"
              />
              {previewUrl && (
                <div className="mt-4 border rounded-lg p-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded"
                  />
                </div>
              )}
            </div>

            {/* Tipo */}
            <div>
              <Label>Tipo de Imagem *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_IMAGEM.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Título */}
            <div>
              <Label>Título</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Radiografia periapical dente 16"
                className="mt-1"
              />
            </div>

            {/* Descrição */}
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Observações sobre a imagem..."
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Dente relacionado */}
            <div>
              <Label>Dente Relacionado (opcional)</Label>
              <Input
                type="number"
                value={formData.denteRelacionado}
                onChange={(e) => setFormData({ ...formData, denteRelacionado: e.target.value })}
                placeholder="Ex: 16 (sistema FDI)"
                className="mt-1"
              />
            </div>

            {/* Analisar com IA */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="analisarIA"
                checked={formData.analisarComIA}
                onChange={(e) => setFormData({ ...formData, analisarComIA: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="analisarIA" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>Analisar automaticamente com IA</span>
                </div>
                <p className="text-xs text-muted-foreground font-normal">
                  Detecta cáries, fraturas e outros problemas automaticamente
                </p>
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogUploadAberto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!arquivoSelecionado || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Enviando..." : "Enviar Imagem"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Visualização */}
      <Dialog open={dialogVisualizacaoAberto} onOpenChange={setDialogVisualizacaoAberto}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {imagemSelecionada && (
            <>
              <DialogHeader>
                <DialogTitle>{imagemSelecionada.titulo}</DialogTitle>
                <DialogDescription>
                  {TIPOS_IMAGEM.find((t) => t.value === imagemSelecionada.tipo)?.label} •{" "}
                  {new Date(imagemSelecionada.dataUpload).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Imagem */}
                <div className="border rounded-lg p-2">
                  <img
                    src={imagemSelecionada.urlImagem}
                    alt={imagemSelecionada.titulo}
                    className="w-full rounded"
                  />
                </div>

                {/* Descrição */}
                {imagemSelecionada.descricao && (
                  <div>
                    <Label>Descrição</Label>
                    <p className="text-sm mt-1">{imagemSelecionada.descricao}</p>
                  </div>
                )}

                {/* Análise por IA */}
                {imagemSelecionada.analisadoPorIA && imagemSelecionada.resultadoIA ? (
                  <div className="border rounded-lg p-4 bg-purple-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      <h4 className="font-semibold">Análise por IA</h4>
                    </div>

                    {/* Detecções */}
                    {imagemSelecionada.resultadoIA.deteccoes && imagemSelecionada.resultadoIA.deteccoes.length > 0 && (
                      <div className="mb-3">
                        <Label className="text-xs">Detecções</Label>
                        <div className="space-y-2 mt-1">
                          {imagemSelecionada.resultadoIA.deteccoes.map((det: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span>{det.tipo}</span>
                              <Badge variant={det.confianca > 80 ? "default" : "secondary"}>
                                {det.confianca}% confiança
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sugestões */}
                    {imagemSelecionada.resultadoIA.sugestoes && imagemSelecionada.resultadoIA.sugestoes.length > 0 && (
                      <div>
                        <Label className="text-xs">Sugestões</Label>
                        <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                          {imagemSelecionada.resultadoIA.sugestoes.map((sug: string, idx: number) => (
                            <li key={idx}>{sug}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleAnalisarComIA}
                    disabled={analisarMutation.isPending}
                    className="w-full"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {analisarMutation.isPending ? "Analisando..." : "Analisar com IA"}
                  </Button>
                )}
              </div>

              <DialogFooter className="flex justify-between">
                <Button
                  variant="destructive"
                  onClick={handleExcluir}
                  disabled={excluirMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <a href={imagemSelecionada.urlImagem} download target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  </Button>
                  <Button onClick={() => setDialogVisualizacaoAberto(false)}>
                    Fechar
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
