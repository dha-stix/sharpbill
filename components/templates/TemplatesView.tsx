"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PageHeader from "@/components/app/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Overlay";
import type { TemplateId } from "@/lib/types";
import DesignGallery from "./DesignGallery";
import { TEMPLATES } from "./registry";
import { sampleInvoice } from "./sample";
import ScaledDocument from "./ScaledDocument";

export default function TemplatesView() {
  const [preview, setPreview] = useState<TemplateId | null>(null);
  const sample = useMemo(() => (preview ? sampleInvoice(preview) : null), [preview]);

  return (
    <div>
      <PageHeader
        title="Invoice designs"
        subtitle="Eight designs, one simple form. Line items × quantity × rate — perfect for services or a monthly salary. Your business details and logo are filled in automatically."
      />
      <DesignGallery
        cta={(id) => (
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => setPreview(id)} className="btn btn-outline flex-1 !min-h-10 text-sm"><Icon name="eye" size={16} /> Preview</button>
            <Link href={`/invoice/create?template=${id}`} className="btn btn-ink flex-1 !min-h-10 text-sm">Use <Icon name="arrowRight" size={16} /></Link>
          </div>
        )}
      />

      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview ? `${TEMPLATES[preview].name} design` : ""}
        subtitle={preview ? `${TEMPLATES[preview].look} · Best for ${TEMPLATES[preview].bestFor.toLowerCase()}` : ""}
        className="!max-w-3xl"
        footer={
          preview && (
            <>
              <span className="text-sm text-muted">Sample data shown</span>
              <Link href={`/invoice/create?template=${preview}`} className="btn btn-lime">Use this design <Icon name="arrowRight" size={16} /></Link>
            </>
          )
        }
      >
        {sample && (
          <div className="max-h-[65vh] overflow-y-auto rounded-lg bg-paper p-3">
            <div className="overflow-hidden rounded bg-white shadow-float">
              <ScaledDocument invoice={sample} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
