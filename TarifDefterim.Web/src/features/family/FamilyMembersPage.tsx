import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useMemo, useState } from 'react';
import {
  approveJoinRequest,
  demoteToMember,
  getFamilyMembers,
  getJoinRequests,
  getMyFamily,
  joinFamily,
  leaveFamily,
  promoteToHead,
  rejectJoinRequest,
  removeMember,
} from '../../api/families';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { FamilyMemberRole } from '../../api/types';
import { useAuth } from '../auth/AuthContext';

type MemberConfirmAction =
  | { type: 'demote'; userId: string; displayName: string }
  | { type: 'remove'; userId: string; displayName: string };

export function FamilyMembersPage() {
  const { currentUserId } = useAuth();
  const queryClient = useQueryClient();

  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinMessage, setJoinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [memberConfirmAction, setMemberConfirmAction] = useState<MemberConfirmAction | null>(null);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

  const familyQuery = useQuery({
    queryKey: ['family', 'me'],
    queryFn: getMyFamily,
  });

  const membersQuery = useQuery({
    queryKey: ['family', 'members'],
    queryFn: getFamilyMembers,
  });

  const currentMember = useMemo(
    () => membersQuery.data?.find((member) => member.userId === currentUserId),
    [membersQuery.data, currentUserId],
  );

  const isHeadOfHousehold = currentMember?.role === FamilyMemberRole.HeadOfHousehold;
  const isMember = currentMember?.role === FamilyMemberRole.Member;

  const headCount = useMemo(
    () =>
      membersQuery.data?.filter((member) => member.role === FamilyMemberRole.HeadOfHousehold)
        .length ?? 0,
    [membersQuery.data],
  );

  const canPromoteToHead = headCount < 2;

  const joinRequestsQuery = useQuery({
    queryKey: ['family', 'join-requests'],
    queryFn: getJoinRequests,
    enabled: isHeadOfHousehold,
  });

  const joinMutation = useMutation({
    mutationFn: joinFamily,
    onSuccess: () => {
      setJoinMessage({ type: 'success', text: 'Katılma isteğiniz gönderildi.' });
      setInviteCode('');
    },
    onError: (error) => {
      setJoinMessage({
        type: 'error',
        text:
          isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : 'Katılma isteği gönderilemedi.',
      });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: ({ familyId, userId }: { familyId: string; userId: string }) =>
      promoteToHead(familyId, userId),
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ['family', 'members'] });
    },
    onError: (error) => {
      setActionError(
        isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Terfi işlemi başarısız oldu.',
      );
    },
  });

  const demoteMutation = useMutation({
    mutationFn: ({ familyId, userId }: { familyId: string; userId: string }) =>
      demoteToMember(familyId, userId),
    onSuccess: async () => {
      setActionError(null);
      setMemberConfirmAction(null);
      await queryClient.invalidateQueries({ queryKey: ['family', 'members'] });
    },
    onError: (error) => {
      setActionError(
        isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Rol değiştirme işlemi başarısız oldu.',
      );
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ familyId, userId }: { familyId: string; userId: string }) =>
      removeMember(familyId, userId),
    onSuccess: async () => {
      setActionError(null);
      setMemberConfirmAction(null);
      await queryClient.invalidateQueries({ queryKey: ['family', 'members'] });
    },
    onError: (error) => {
      setActionError(
        isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Üye çıkarma işlemi başarısız oldu.',
      );
    },
  });

  const leaveMutation = useMutation({
    mutationFn: leaveFamily,
    onSuccess: async () => {
      setActionError(null);
      setLeaveConfirmOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['family', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['family', 'members'] }),
      ]);
    },
    onError: (error) => {
      setActionError(
        isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Aileden ayrılma işlemi başarısız oldu.',
      );
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveJoinRequest,
    onSuccess: async () => {
      setActionError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['family', 'join-requests'] }),
        queryClient.invalidateQueries({ queryKey: ['family', 'members'] }),
      ]);
    },
    onError: (error) => {
      setActionError(
        isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'İstek onaylanamadı.',
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectJoinRequest,
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ['family', 'join-requests'] });
    },
    onError: (error) => {
      setActionError(
        isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'İstek reddedilemedi.',
      );
    },
  });

  const handleCopyInviteCode = async () => {
    if (!familyQuery.data?.inviteCode) {
      return;
    }

    await navigator.clipboard.writeText(familyQuery.data.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = (event: React.FormEvent) => {
    event.preventDefault();
    setJoinMessage(null);
    if (!inviteCode.trim()) {
      setJoinMessage({ type: 'error', text: 'Davet kodu gerekli.' });
      return;
    }
    joinMutation.mutate({ inviteCode: inviteCode.trim() });
  };

  const handleMemberConfirm = () => {
    if (!memberConfirmAction || !familyQuery.data) {
      return;
    }

    if (memberConfirmAction.type === 'demote') {
      demoteMutation.mutate({
        familyId: familyQuery.data.id,
        userId: memberConfirmAction.userId,
      });
      return;
    }

    removeMemberMutation.mutate({
      familyId: familyQuery.data.id,
      userId: memberConfirmAction.userId,
    });
  };

  const isMemberActionPending = demoteMutation.isPending || removeMemberMutation.isPending;

  const memberConfirmMessage =
    memberConfirmAction?.type === 'demote'
      ? `${memberConfirmAction.displayName} adlı üyeyi aile üyesi yapmak istediğinize emin misiniz?`
      : memberConfirmAction?.type === 'remove'
        ? `${memberConfirmAction.displayName} adlı üyeyi aileden çıkarmak istediğinize emin misiniz?`
        : '';

  const memberConfirmLabel =
    memberConfirmAction?.type === 'demote' ? 'Evet, Aile Üyesi Yap' : 'Evet, Çıkar';

  const pendingCount = joinRequestsQuery.data?.length ?? 0;
  const isLoading = familyQuery.isLoading || membersQuery.isLoading;

  if (isLoading) {
    return <p className="text-muted">Yükleniyor...</p>;
  }

  if (familyQuery.isError || membersQuery.isError) {
    return (
      <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
        Aile bilgileri yüklenirken bir hata oluştu.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-semibold text-ink">Ailem</h1>

      {isMember && (
        <section className="card p-6">
          <h2 className="font-heading mb-2 text-xl font-semibold text-ink">Aileden Ayrıl</h2>
          <p className="mb-4 text-sm text-muted">
            Aileden ayrılırsanız kendi tek kişilik ailenize dönersiniz.
          </p>
          <button
            type="button"
            onClick={() => setLeaveConfirmOpen(true)}
            className="rounded-full border border-red-200 bg-transparent px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
          >
            Aileden Ayrıl
          </button>
        </section>
      )}

      {familyQuery.data && (
        <section className="card p-6">
          <h2 className="font-heading mb-4 text-xl font-semibold text-ink">Davet Kodu</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-2xl border border-border bg-cream px-6 py-4">
              <p className="text-sm text-muted">Davet Kodu</p>
              <p className="break-all font-heading text-2xl font-semibold tracking-widest text-ink">
                {familyQuery.data.inviteCode}
              </p>
            </div>
            <button type="button" onClick={handleCopyInviteCode} className="btn-secondary">
              {copied ? 'Kopyalandı!' : 'Kopyala'}
            </button>
          </div>
        </section>
      )}

      <section className="card p-6">
        <h2 className="font-heading mb-4 text-xl font-semibold text-ink">Aile Üyeleri</h2>
        <ul className="space-y-3">
          {membersQuery.data?.map((member) => {
            const isSelf = member.userId === currentUserId;
            const showHeadActions = isHeadOfHousehold && !isSelf && familyQuery.data;

            return (
              <li
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-cream px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-medium text-ink">{member.displayName}</span>
                  {member.role === FamilyMemberRole.HeadOfHousehold ? (
                    <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
                      Aile Büyüğü
                    </span>
                  ) : (
                    <span className="badge">Aile Üyesi</span>
                  )}
                  {isSelf && <span className="text-xs text-muted">(Sen)</span>}
                </div>

                {showHeadActions && (
                  <div className="flex flex-wrap gap-2">
                    {member.role === FamilyMemberRole.HeadOfHousehold && (
                      <button
                        type="button"
                        onClick={() =>
                          setMemberConfirmAction({
                            type: 'demote',
                            userId: member.userId,
                            displayName: member.displayName,
                          })
                        }
                        disabled={isMemberActionPending || promoteMutation.isPending}
                        className="btn-secondary px-4 py-1.5 text-xs"
                      >
                        Aile Üyesi Yap
                      </button>
                    )}

                    {member.role === FamilyMemberRole.Member && canPromoteToHead && (
                      <button
                        type="button"
                        onClick={() =>
                          promoteMutation.mutate({
                            familyId: familyQuery.data!.id,
                            userId: member.userId,
                          })
                        }
                        disabled={promoteMutation.isPending || isMemberActionPending}
                        className="btn-secondary px-4 py-1.5 text-xs"
                      >
                        Aile Büyüğü Yap
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setMemberConfirmAction({
                          type: 'remove',
                          userId: member.userId,
                          displayName: member.displayName,
                        })
                      }
                      disabled={isMemberActionPending || promoteMutation.isPending}
                      className="rounded-full border border-red-200 bg-transparent px-4 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Çıkar
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card p-6">
        <h2 className="font-heading mb-4 text-xl font-semibold text-ink">Aileye Katıl</h2>
        <form onSubmit={handleJoin} className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <label htmlFor="inviteCode" className="label-field">
              Davet Kodu
            </label>
            <input
              id="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
              placeholder="XXXXXXXX"
              className="input-field uppercase tracking-widest"
            />
          </div>
          <button type="submit" disabled={joinMutation.isPending} className="btn-primary">
            {joinMutation.isPending ? 'Gönderiliyor...' : 'Katıl'}
          </button>
        </form>
        {joinMessage && (
          <p
            className={`mt-3 rounded-2xl px-4 py-3 text-sm ${
              joinMessage.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {joinMessage.text}
          </p>
        )}
      </section>

      {isHeadOfHousehold && (
        <section className="card border-accent/30 p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="font-heading text-xl font-semibold text-ink">Bekleyen Katılma İstekleri</h2>
            {pendingCount > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-semibold text-white">
                {pendingCount}
              </span>
            )}
          </div>

          {joinRequestsQuery.isLoading && <p className="text-muted">Yükleniyor...</p>}

          {!joinRequestsQuery.isLoading && pendingCount === 0 && (
            <p className="text-muted">Bekleyen katılma isteği yok.</p>
          )}

          {pendingCount > 0 && (
            <ul className="space-y-3">
              {joinRequestsQuery.data?.map((request) => (
                <li
                  key={request.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-cream px-4 py-3"
                >
                  <span className="font-medium text-ink">{request.requesterDisplayName}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => approveMutation.mutate(request.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="btn-primary px-4 py-1.5 text-xs"
                    >
                      Kabul Et
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectMutation.mutate(request.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="btn-secondary px-4 py-1.5 text-xs"
                    >
                      Reddet
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {actionError && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>
      )}

      <ConfirmModal
        open={memberConfirmAction !== null}
        onClose={() => {
          if (!isMemberActionPending) {
            setMemberConfirmAction(null);
          }
        }}
        onConfirm={handleMemberConfirm}
        message={memberConfirmMessage}
        confirmLabel={memberConfirmLabel}
        isPending={isMemberActionPending}
      />

      <ConfirmModal
        open={leaveConfirmOpen}
        onClose={() => {
          if (!leaveMutation.isPending) {
            setLeaveConfirmOpen(false);
          }
        }}
        onConfirm={() => leaveMutation.mutate()}
        message="Aileden ayrılmak istediğinize emin misiniz? Kendi tek kişilik ailenize döneceksiniz."
        confirmLabel={leaveMutation.isPending ? 'Ayrılıyor...' : 'Evet, Ayrıl'}
      />
    </div>
  );
}
