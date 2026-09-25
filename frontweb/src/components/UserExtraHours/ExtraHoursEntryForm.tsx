import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
  saveUserExtraHours,
  deleteUserExtraHours,
} from 'services/userExtraHoursService';
import { UserExtraHoursDTO, UserExtraHoursStatus } from 'types/userExtraHours';
import { usePermissions } from 'hooks/usePermissions';

import './ExtraHoursEntryForm.scss';

const MAX_HOURS = 24;
const MAX_COMMENT_LENGTH = 255;

const STATUS_LABELS: Record<UserExtraHoursStatus, string> = {
  [UserExtraHoursStatus.PENDING]: 'Aguarda aprovação',
  [UserExtraHoursStatus.APPROVED]: 'Aprovado',
  [UserExtraHoursStatus.REJECTED]: 'Rejeitado',
};

interface ExtraHoursEntryFormProps {
  userId: number;
  /** ISO date (YYYY-MM-DD) the entry is being created/edited for. */
  date: string;
  /** Existing entry for that date, or null when launching a new one. */
  entry: UserExtraHoursDTO | null;
  onClose: () => void;
  /** Called after a successful save/delete, before the form closes. */
  onSaved: () => void;
}

/**
 * Floating form to launch, edit or delete a single Banco de Horas entry.
 * Opened from both the calendar (day/event click) and the history table (row
 * click), so it is owned by the page. Callers should pass a `key` derived from
 * the date so the fields reset when the selection changes while it is open.
 */
const ExtraHoursEntryForm: React.FC<ExtraHoursEntryFormProps> = ({
  userId,
  date,
  entry,
  onClose,
  onSaved,
}) => {
  const [form, setForm] = useState<{ hours: number; comment: string }>({
    hours: entry ? entry.hours : 0,
    comment: entry?.comment || '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const { isAdmin } = usePermissions();

  // Once an ADMIN has approved an entry, only an ADMIN can still change it —
  // everyone else (including the owner) sees it read-only. A REJECTED entry
  // stays editable so the owner can correct and resubmit it.
  const isLocked =
    !!entry && entry.status === UserExtraHoursStatus.APPROVED && !isAdmin();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = async () => {
    if (!form.hours || Math.abs(form.hours) > MAX_HOURS) {
      setFormError(`As horas devem estar entre -${MAX_HOURS} e ${MAX_HOURS}`);
      return;
    }
    setFormError(null);

    const dto: UserExtraHoursDTO = {
      id: entry?.id,
      userId,
      date,
      hours: form.hours,
      comment: form.comment,
    };
    try {
      await saveUserExtraHours(dto);
      onSaved();
      onClose();
    } catch (error) {
      console.error('Erro ao gravar horas extra:', error);
      setFormError('Não foi possível gravar. Tente novamente.');
    }
  };

  const handleDelete = async () => {
    if (!entry?.id) return;
    try {
      await deleteUserExtraHours(entry.id);
      onSaved();
      onClose();
    } catch (error) {
      console.error('Erro ao excluir horas extra:', error);
      setFormError('Não foi possível excluir. Tente novamente.');
    }
  };

  return (
    <div className="extra-hours-form">
      <h4>{moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY')}</h4>
      {entry?.status && (
        <p className={`extra-hours-status status-${entry.status.toLowerCase()}`}>
          {STATUS_LABELS[entry.status]}
        </p>
      )}
      {entry?.status === UserExtraHoursStatus.REJECTED && entry.rejectionReason && (
        <p className="extra-hours-hint">Motivo: {entry.rejectionReason}</p>
      )}
      {formError && <p className="extra-hours-error">{formError}</p>}
      <input
        type="number"
        value={form.hours}
        min={-MAX_HOURS}
        max={MAX_HOURS}
        step={0.5}
        disabled={isLocked}
        onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
        placeholder="Horas (+/-)"
      />
      <p className="extra-hours-hint">
        Valores positivos = horas extra (ex.: 2 = +2h acumuladas). Valores
        negativos = falta (ex.: -1.5 = 1h30 em falta). Só são aceites
        múltiplos de 0,5h.
      </p>
      <input
        type="text"
        value={form.comment}
        maxLength={MAX_COMMENT_LENGTH}
        disabled={isLocked}
        onChange={(e) => setForm({ ...form, comment: e.target.value })}
        placeholder="Comentário"
      />
      {isLocked ? (
        <p className="extra-hours-hint">
          Lançamento já aprovado. Peça a um administrador para o alterar.
        </p>
      ) : (
        <button onClick={handleSave}>Gravar</button>
      )}
      {entry && !isLocked && <button onClick={handleDelete}>Excluir</button>}
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
};

export default ExtraHoursEntryForm;
