import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface XmlPreviewProps {
  xml: string;
  isOpen: boolean;
  onClose: () => void;
}

export function XmlPreview({ xml, isOpen, onClose }: XmlPreviewProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>XML Preview</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto max-h-[60vh]">
          <pre className="text-sm bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
            {xml}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}