import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  User,
  Send,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  FileText,
  X,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Chat Assistente com IA
 * Assistente inteligente para ajudar dentistas
 */

interface Mensagem {
  id: number;
  papel: "user" | "assistant" | "system";
  conteudo: string;
  anexos?: Array<{
    tipo: string;
    url: string;
    nome?: string;
  }>;
  timestamp: Date;
  tokens?: number;
}

interface ChatAssistenteIAProps {
  clinicaId: number;
  utenteId?: number;
  contexto?: "geral" | "diagnostico" | "tratamento" | "medicacao";
  dadosContexto?: any;
  onFechar?: () => void;
}

export function ChatAssistenteIA({
  clinicaId,
  utenteId,
  contexto = "geral",
  dadosContexto,
  onFechar,
}: ChatAssistenteIAProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: 1,
      papel: "assistant",
      conteudo: `Olá! Sou o assistente de IA do DentCare Pro. 🦷

Como posso ajudar hoje? Posso:
• Analisar imagens dentárias
• Sugerir diagnósticos
• Ajudar com planos de tratamento
• Responder dúvidas clínicas
• Recomendar medicações
• Consultar protocolos

O que precisa?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [conversaId, setConversaId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll para última mensagem
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  const enviarMensagem = async () => {
    if (!inputValue.trim() || carregando) return;

    const novaMensagemUser: Mensagem = {
      id: Date.now(),
      papel: "user",
      conteudo: inputValue,
      timestamp: new Date(),
    };

    setMensagens((prev) => [...prev, novaMensagemUser]);
    setInputValue("");
    setCarregando(true);

    try {
      // Simular chamada à API (substituir por chamada real)
      const response = await fetch("/api/ia/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicaId,
          utenteId,
          contexto,
          mensagem: inputValue,
          conversaId,
          dadosContexto,
        }),
      });

      const data = await response.json();

      const novaMensagemAssistant: Mensagem = {
        id: Date.now() + 1,
        papel: "assistant",
        conteudo: data.resposta,
        timestamp: new Date(),
        tokens: data.tokens,
      };

      setMensagens((prev) => [...prev, novaMensagemAssistant]);

      if (!conversaId && data.conversaId) {
        setConversaId(data.conversaId);
      }
    } catch (error: any) {
      toast.error("Erro ao comunicar com IA: " + error.message);

      const mensagemErro: Mensagem = {
        id: Date.now() + 1,
        papel: "assistant",
        conteudo:
          "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        timestamp: new Date(),
      };

      setMensagens((prev) => [...prev, mensagemErro]);
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  const sugestoes = [
    "Analisar raio-X",
    "Sugerir diagnóstico",
    "Plano de tratamento",
    "Prescrever medicação",
    "Protocolo de urgência",
  ];

  const usarSugestao = (sugestao: string) => {
    setInputValue(sugestao);
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bot className="h-6 w-6 text-primary" />
              <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <CardTitle>Assistente IA</CardTitle>
              <p className="text-xs text-muted-foreground">
                {contexto === "geral" && "Assistência geral"}
                {contexto === "diagnostico" && "Ajuda com diagnóstico"}
                {contexto === "tratamento" && "Planejamento de tratamento"}
                {contexto === "medicacao" && "Prescrição de medicamentos"}
              </p>
            </div>
          </div>
          {onFechar && (
            <Button variant="ghost" size="sm" onClick={onFechar}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Mensagens */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {mensagens.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.papel === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback>
                    {msg.papel === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>

                {/* Conteúdo */}
                <div
                  className={`flex-1 max-w-[80%] ${msg.papel === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`rounded-lg p-3 ${
                      msg.papel === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.conteudo}</p>

                    {/* Anexos */}
                    {msg.anexos && msg.anexos.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.anexos.map((anexo, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs bg-background/50 rounded p-2"
                          >
                            {anexo.tipo === "imagem" ? (
                              <ImageIcon className="h-3 w-3" />
                            ) : (
                              <FileText className="h-3 w-3" />
                            )}
                            <span className="truncate">{anexo.nome || "Anexo"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Metadados */}
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{msg.timestamp.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</span>
                    {msg.tokens && (
                      <Badge variant="outline" className="text-[10px]">
                        {msg.tokens} tokens
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Indicador de digitação */}
            {carregando && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Sugestões rápidas */}
        {mensagens.length <= 2 && (
          <div className="border-t p-3">
            <p className="text-xs text-muted-foreground mb-2">Sugestões:</p>
            <div className="flex flex-wrap gap-2">
              {sugestoes.map((sug) => (
                <Button
                  key={sug}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => usarSugestao(sug)}
                >
                  {sug}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={carregando}
              className="flex-1"
            />
            <Button onClick={enviarMensagem} disabled={carregando || !inputValue.trim()}>
              {carregando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            💡 A IA pode cometer erros. Sempre revise as sugestões.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
