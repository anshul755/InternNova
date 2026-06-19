import { memo } from "react";
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  useMediaQuery,
} from "@mui/material";

const safeContainerSx = {
  width: "100%",
  maxWidth: "100%",
  overflow: "hidden",
  boxSizing: "border-box",
};

const cardSafeSx = {
  ...safeContainerSx,
  height: "100%",
  borderRadius: "24px",
  background: "var(--app-glass)",
  border: "1px solid var(--app-border)",
  boxShadow: "var(--app-shadow)",
};

const panelSafeSx = {
  ...safeContainerSx,
  borderRadius: "28px",
  background: "var(--app-glass-strong)",
  border: "1px solid var(--app-border-strong)",
  boxShadow: "var(--app-shadow-strong)",
};

const shimmerSx = {
  transform: "translateZ(0)",
  "&::after": {
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
  },
};

const srOnlySx = {
  position: "absolute",
  width: 1,
  height: 1,
  p: 0,
  m: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  border: 0,
};

const PremiumSkeleton = memo(function PremiumSkeleton({ sx, ...props }) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  return (
    <Skeleton
      variant="rounded"
      animation={reducedMotion ? false : "wave"}
      sx={[shimmerSx, sx]}
      {...props}
    />
  );
});

export const StatsCardSkeleton = memo(function StatsCardSkeleton() {
  return (
    <Card className="glass-card" elevation={0} sx={cardSafeSx}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <PremiumSkeleton width="48%" height={18} />
          <PremiumSkeleton width={40} height={40} sx={{ borderRadius: 3 }} />
        </Stack>
        <PremiumSkeleton width="36%" height={44} sx={{ mt: 2 }} />
        <PremiumSkeleton width="44%" height={16} sx={{ mt: 1.25 }} />
      </CardContent>
    </Card>
  );
});

export const ProfileCardSkeleton = memo(function ProfileCardSkeleton() {
  return (
    <Card className="dashboard-profile-card" elevation={0} sx={cardSafeSx}>
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Box sx={{ width: "65%" }}>
            <PremiumSkeleton width="40%" height={14} />
            <PremiumSkeleton width="85%" height={30} sx={{ mt: 1 }} />
          </Box>
          <PremiumSkeleton
            width={56}
            height={56}
            sx={{ borderRadius: "18px" }}
          />
        </Stack>

        <Box
          sx={{
            mt: 2,
            display: "grid",
            gap: 2,
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          }}
        >
          <Card className="glass-card" elevation={0} sx={cardSafeSx}>
            <CardContent sx={{ p: 1.5 }}>
              <PremiumSkeleton width="60%" height={14} />
              <PremiumSkeleton width="90%" height={20} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
          <Card className="glass-card" elevation={0} sx={cardSafeSx}>
            <CardContent sx={{ p: 1.5 }}>
              <PremiumSkeleton width="52%" height={14} />
              <PremiumSkeleton width="88%" height={20} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
          <PremiumSkeleton width={72} height={24} sx={{ borderRadius: 99 }} />
          <PremiumSkeleton width={84} height={24} sx={{ borderRadius: 99 }} />
          <PremiumSkeleton width={66} height={24} sx={{ borderRadius: 99 }} />
        </Stack>

        <PremiumSkeleton
          width="100%"
          height={44}
          sx={{ mt: 3, borderRadius: 999 }}
        />
      </CardContent>
    </Card>
  );
});

export const JobCardSkeleton = memo(function JobCardSkeleton() {
  return (
    <Card className="glass-card" elevation={0} sx={cardSafeSx}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <PremiumSkeleton width={40} height={40} sx={{ borderRadius: 2 }} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <PremiumSkeleton width="60%" height={24} />
            <PremiumSkeleton width="42%" height={16} sx={{ mt: 0.75 }} />
          </Box>
        </Stack>

        <PremiumSkeleton width="90%" height={14} sx={{ mt: 2 }} />
        <PremiumSkeleton width="72%" height={14} sx={{ mt: 1 }} />

        <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
          <PremiumSkeleton width={66} height={24} sx={{ borderRadius: 99 }} />
          <PremiumSkeleton width={72} height={24} sx={{ borderRadius: 99 }} />
          <PremiumSkeleton width={58} height={24} sx={{ borderRadius: 99 }} />
        </Stack>

        <PremiumSkeleton
          width="44%"
          height={36}
          sx={{ mt: 2.5, borderRadius: 99 }}
        />
      </CardContent>
    </Card>
  );
});

export const ActivityCardSkeleton = memo(function ActivityCardSkeleton() {
  return (
    <Card className="glass-card" elevation={0} sx={cardSafeSx}>
      <CardContent sx={{ p: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ justifyContent: "space-between" }}
        >
          <Box sx={{ width: "70%" }}>
            <PremiumSkeleton width="35%" height={12} />
            <PremiumSkeleton width="78%" height={22} sx={{ mt: 0.8 }} />
            <PremiumSkeleton width="52%" height={16} sx={{ mt: 0.8 }} />
          </Box>
          <PremiumSkeleton width={90} height={24} sx={{ borderRadius: 99 }} />
        </Stack>
        <PremiumSkeleton width="42%" height={14} sx={{ mt: 1.5 }} />
      </CardContent>
    </Card>
  );
});

export const TableRowSkeleton = memo(function TableRowSkeleton() {
  return (
    <Box
      sx={{
        ...safeContainerSx,
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr 1fr auto",
        gap: 2,
        alignItems: "center",
        p: 2,
        borderRadius: "14px",
        border: "1px solid var(--app-border)",
      }}
      aria-hidden="true"
    >
      <PremiumSkeleton width="68%" height={18} />
      <PremiumSkeleton width="80%" height={16} />
      <PremiumSkeleton width="72%" height={16} />
      <PremiumSkeleton width={96} height={30} sx={{ borderRadius: 99 }} />
    </Box>
  );
});

function HeroSkeleton({ ctaCount = 2 }) {
  return (
    <Box className="dashboard-hero" sx={{ ...safeContainerSx, p: 3 }}>
      <Box
        sx={{
          ...safeContainerSx,
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", lg: "1.35fr 0.65fr" },
        }}
      >
        <Stack spacing={1.25} sx={{ minWidth: 0, height: "100%" }}>
          <PremiumSkeleton width="22%" height={14} />
          <PremiumSkeleton width="68%" height={54} />
          <PremiumSkeleton width="88%" height={18} />
          <PremiumSkeleton width="62%" height={18} />
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mt: 2, flexWrap: "wrap" }}
          >
            {Array.from({ length: ctaCount }).map((_, index) => (
              <PremiumSkeleton
                key={index}
                width={index === 0 ? 142 : 170}
                height={42}
                sx={{ borderRadius: 99 }}
              />
            ))}
          </Stack>
        </Stack>

        <ProfileCardSkeleton />
      </Box>
    </Box>
  );
}

export const TalentDashboardSkeleton = memo(function TalentDashboardSkeleton() {
  return (
    <Box
      className="page-enter"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading talent dashboard"
      sx={{ ...safeContainerSx, display: "grid", gap: 4 }}
    >
      <HeroSkeleton ctaCount={3} />

      <Box
        sx={{
          ...safeContainerSx,
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </Box>

      <Box
        sx={{
          ...safeContainerSx,
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", xl: "0.9fr 1.1fr" },
        }}
      >
        <Card
          className="glass-panel"
          elevation={0}
          sx={{ ...panelSafeSx, p: 3 }}
        >
          <PremiumSkeleton width="28%" height={14} />
          <PremiumSkeleton width="52%" height={32} sx={{ mt: 1 }} />
          <Stack spacing={1.5} sx={{ mt: 3 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <ActivityCardSkeleton key={index} />
            ))}
          </Stack>
        </Card>

        <Card
          className="glass-panel"
          elevation={0}
          sx={{ ...panelSafeSx, p: 3 }}
        >
          <PremiumSkeleton width="22%" height={14} />
          <PremiumSkeleton width="40%" height={32} sx={{ mt: 1 }} />
          <Box
            sx={{
              ...safeContainerSx,
              mt: 2,
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
            }}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <JobCardSkeleton key={index} />
            ))}
          </Box>
        </Card>
      </Box>

      <Box component="span" sx={srOnlySx}>
        Loading dashboard content
      </Box>
    </Box>
  );
});

export const CompanyDashboardSkeleton = memo(
  function CompanyDashboardSkeleton() {
    return (
      <Box
        className="page-enter"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading company dashboard"
        sx={{ ...safeContainerSx, display: "grid", gap: 4 }}
      >
        <HeroSkeleton ctaCount={2} />

        <Box
          sx={{
            ...safeContainerSx,
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(5, minmax(0, 1fr))",
            },
          }}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))}
        </Box>

        <Box
          sx={{
            ...safeContainerSx,
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1fr) 24rem" },
          }}
        >
          <Card
            className="glass-panel"
            elevation={0}
            sx={{ ...panelSafeSx, p: 3 }}
          >
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={2}
              sx={{ justifyContent: "space-between" }}
            >
              <Box sx={{ width: { xs: "100%", lg: "45%" } }}>
                <PremiumSkeleton width="26%" height={14} />
                <PremiumSkeleton width="62%" height={30} sx={{ mt: 1 }} />
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <PremiumSkeleton
                  width={66}
                  height={32}
                  sx={{ borderRadius: 99 }}
                />
                <PremiumSkeleton
                  width={68}
                  height={32}
                  sx={{ borderRadius: 99 }}
                />
                <PremiumSkeleton
                  width={76}
                  height={32}
                  sx={{ borderRadius: 99 }}
                />
              </Stack>
            </Stack>

            <Stack spacing={1.5} sx={{ mt: 3 }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </Stack>
          </Card>

          <Stack spacing={3}>
            <Card
              className="glass-panel"
              elevation={0}
              sx={{ ...panelSafeSx, p: 3 }}
            >
              <PremiumSkeleton width="34%" height={14} />
              <PremiumSkeleton width="56%" height={28} sx={{ mt: 1 }} />
              <Stack spacing={1.25} sx={{ mt: 2.5 }}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <ActivityCardSkeleton key={index} />
                ))}
              </Stack>
            </Card>

            <Card
              className="dashboard-hero"
              elevation={0}
              sx={{ ...safeContainerSx, p: 3, borderRadius: "28px" }}
            >
              <PremiumSkeleton
                width={48}
                height={48}
                sx={{ borderRadius: 2.5 }}
              />
              <PremiumSkeleton width="54%" height={30} sx={{ mt: 2 }} />
              <PremiumSkeleton width="94%" height={16} sx={{ mt: 1 }} />
              <PremiumSkeleton width="80%" height={16} sx={{ mt: 0.8 }} />
              <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                <PremiumSkeleton
                  width="48%"
                  height={40}
                  sx={{ borderRadius: 99 }}
                />
                <PremiumSkeleton
                  width="48%"
                  height={40}
                  sx={{ borderRadius: 99 }}
                />
              </Stack>
            </Card>
          </Stack>
        </Box>
      </Box>
    );
  },
);

export const CompanyJobsSkeleton = memo(function CompanyJobsSkeleton() {
  return (
    <Box
      className="page-enter"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading jobs dashboard"
      sx={{ ...safeContainerSx, display: "grid", gap: 4 }}
    >
      <Box sx={{ ...safeContainerSx }}>
        <PremiumSkeleton width="18%" height={14} />
        <PremiumSkeleton width="28%" height={48} sx={{ mt: 1 }} />
        <PremiumSkeleton width="64%" height={16} sx={{ mt: 1.2 }} />
      </Box>

      <Box
        sx={{
          ...safeContainerSx,
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </Box>

      <Box
        sx={{
          ...safeContainerSx,
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", xl: "1.1fr 0.9fr" },
        }}
      >
        <Card
          className="glass-card"
          elevation={0}
          sx={{ ...cardSafeSx, p: 3 }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between" }}
          >
            <Box sx={{ width: { xs: "100%", lg: "40%" } }}>
              <PremiumSkeleton width="30%" height={14} />
              <PremiumSkeleton width="82%" height={28} sx={{ mt: 1 }} />
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <PremiumSkeleton
                width={62}
                height={30}
                sx={{ borderRadius: 99 }}
              />
              <PremiumSkeleton
                width={62}
                height={30}
                sx={{ borderRadius: 99 }}
              />
              <PremiumSkeleton
                width={62}
                height={30}
                sx={{ borderRadius: 99 }}
              />
            </Stack>
          </Stack>

          <Stack spacing={1.5} sx={{ mt: 3 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <JobCardSkeleton key={index} />
            ))}
          </Stack>
        </Card>

        <Stack spacing={3}>
          <Card
            className="glass-card"
            elevation={0}
            sx={{ ...cardSafeSx, p: 3 }}
          >
            <PremiumSkeleton width="46%" height={30} />
            <Stack spacing={1.5} sx={{ mt: 2.5 }}>
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </Stack>
          </Card>

          <Card
            className="glass-card"
            elevation={0}
            sx={{ ...cardSafeSx, p: 3 }}
          >
            <PremiumSkeleton width="38%" height={30} />
            <Stack spacing={1.25} sx={{ mt: 2.5 }}>
              <PremiumSkeleton
                width="100%"
                height={50}
                sx={{ borderRadius: 3 }}
              />
              <PremiumSkeleton
                width="100%"
                height={50}
                sx={{ borderRadius: 3 }}
              />
            </Stack>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
});

/* ─── Job Listing Card Skeleton ─────────────────────────────────────────── */
const JobListingCardSkeleton = memo(function JobListingCardSkeleton() {
  return (
    <Card className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 3 }}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", lg: "row" },
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
          <PremiumSkeleton
            width={56}
            height={56}
            sx={{ borderRadius: "16px", flexShrink: 0 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <PremiumSkeleton
                width={60}
                height={20}
                sx={{ borderRadius: 99 }}
              />
              <PremiumSkeleton
                width={72}
                height={20}
                sx={{ borderRadius: 99 }}
              />
            </Stack>
            <PremiumSkeleton width="55%" height={24} />
            <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
              <PremiumSkeleton width="18%" height={16} />
              <PremiumSkeleton width="14%" height={16} />
              <PremiumSkeleton width="20%" height={16} />
            </Stack>
            <PremiumSkeleton width="90%" height={14} sx={{ mt: 1.5 }} />
            <PremiumSkeleton width="72%" height={14} sx={{ mt: 0.5 }} />
          </Box>
        </Stack>
        <Stack spacing={1} sx={{ width: { xs: "100%", lg: 160 }, flexShrink: 0 }}>
          <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 99 }} />
          <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 99 }} />
        </Stack>
      </Box>
    </Card>
  );
});

/* ─── JobListingsSkeleton ──────────────────────────────────────────────── */
export const JobListingsSkeleton = memo(function JobListingsSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Loading job listings"
      sx={{ ...safeContainerSx, display: "grid", gap: 3 }}
    >
      <Card className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 3 }}>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
              lg: "2fr 1fr 1fr 1fr",
            },
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Box key={i}>
              <PremiumSkeleton width="30%" height={12} sx={{ mb: 0.75 }} />
              <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 2 }} />
            </Box>
          ))}
        </Box>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <PremiumSkeleton width={180} height={26} />
      </Box>

      <Stack spacing={2}>
        {Array.from({ length: 5 }).map((_, i) => (
          <JobListingCardSkeleton key={i} />
        ))}
      </Stack>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ justifyContent: "center", mt: 1 }}
      >
        <PremiumSkeleton width={80} height={36} sx={{ borderRadius: 2 }} />
        <PremiumSkeleton width={100} height={36} sx={{ borderRadius: 2 }} />
        <PremiumSkeleton width={60} height={36} sx={{ borderRadius: 2 }} />
      </Stack>
    </Box>
  );
});

/* ─── JobDetailsSkeleton ───────────────────────────────────────────────── */
export const JobDetailsSkeleton = memo(function JobDetailsSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Loading job details"
      sx={{ ...safeContainerSx, maxWidth: 960, mx: "auto", display: "grid", gap: 3, px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}
    >
      <Card className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
              <PremiumSkeleton width="50%" height={30} />
              <PremiumSkeleton width={60} height={24} sx={{ borderRadius: 99 }} />
              <PremiumSkeleton width={72} height={24} sx={{ borderRadius: 99 }} />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <PremiumSkeleton width="16%" height={16} />
              <PremiumSkeleton width="12%" height={16} />
              <PremiumSkeleton width="18%" height={16} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <PremiumSkeleton width="14%" height={14} />
              <PremiumSkeleton width="18%" height={14} />
            </Stack>
          </Box>
          <Stack spacing={1.5} sx={{ width: { xs: "100%", md: 180 }, flexShrink: 0 }}>
            <PremiumSkeleton width="100%" height={44} sx={{ borderRadius: 2 }} />
            <PremiumSkeleton width="100%" height={44} sx={{ borderRadius: 2 }} />
            <PremiumSkeleton width="60%" height={12} sx={{ alignSelf: "flex-end" }} />
          </Stack>
        </Box>
        <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid var(--app-border)" }}>
          <PremiumSkeleton width="12%" height={12} sx={{ mb: 1.5 }} />
          <Stack direction="row" spacing={1}>
            {Array.from({ length: 5 }).map((_, i) => (
              <PremiumSkeleton key={i} width={72} height={28} sx={{ borderRadius: 99 }} />
            ))}
          </Stack>
        </Box>
      </Card>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
        }}
      >
        <Stack spacing={3}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 3 }}>
              <PremiumSkeleton width="30%" height={22} sx={{ mb: 2 }} />
              <PremiumSkeleton width="100%" height={14} />
              <PremiumSkeleton width="95%" height={14} sx={{ mt: 1 }} />
              <PremiumSkeleton width="88%" height={14} sx={{ mt: 1 }} />
              <PremiumSkeleton width="72%" height={14} sx={{ mt: 1 }} />
            </Card>
          ))}
        </Stack>

        <Stack spacing={3}>
          <Card className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 3 }}>
            <PremiumSkeleton width="40%" height={20} sx={{ mb: 2.5 }} />
            {Array.from({ length: 6 }).map((_, i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <PremiumSkeleton width="28%" height={12} />
                <PremiumSkeleton width="60%" height={16} sx={{ mt: 0.5 }} />
              </Box>
            ))}
          </Card>
          <PremiumSkeleton width="100%" height={44} sx={{ borderRadius: 3 }} />
          <PremiumSkeleton width="100%" height={44} sx={{ borderRadius: 3 }} />
        </Stack>
      </Box>
    </Box>
  );
});

/* ─── ApplicationManagementSkeleton ────────────────────────────────────── */
export const ApplicationManagementSkeleton = memo(function ApplicationManagementSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Loading applications"
      sx={{ ...safeContainerSx, display: "grid", gap: 3 }}
    >
      {/* Search and Status Filter Bar Placeholder */}
      <Card
        className="glass-card"
        elevation={0}
        sx={{ ...cardSafeSx, p: 2, mb: 1 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
            alignItems: "stretch",
          }}
        >
          <PremiumSkeleton
            sx={{ flex: 1, height: 40, borderRadius: "12px" }}
          />
          <PremiumSkeleton
            sx={{ width: { xs: "100%", sm: 160 }, height: 40, borderRadius: "12px" }}
          />
        </Box>
      </Card>

      {/* Stats Grid Placeholder (3 columns) */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, 1fr)",
          },
          mb: 2,
        }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <Card
            key={i}
            className="glass-card"
            elevation={0}
            sx={{ ...cardSafeSx, p: 2.5, textAlign: "center" }}
          >
            <PremiumSkeleton width="40%" height={28} sx={{ mx: "auto" }} />
            <PremiumSkeleton width="60%" height={12} sx={{ mt: 1, mx: "auto" }} />
          </Card>
        ))}
      </Box>

      {/* Applications List Placeholder */}
      <Stack spacing={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="glass-card"
            elevation={0}
            sx={{ ...cardSafeSx, p: 3 }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { sm: "flex-start" },
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1, flexWrap: "wrap" }}>
                  <PremiumSkeleton width="35%" height={24} />
                  <PremiumSkeleton width={80} height={20} sx={{ borderRadius: "6px" }} />
                </Stack>
                <PremiumSkeleton width="20%" height={16} sx={{ mb: 1 }} />
                <PremiumSkeleton width="15%" height={14} sx={{ mb: 2 }} />
                
                {/* Motivation statement text block */}
                <Stack spacing={1} sx={{ mt: 1.5 }}>
                  <PremiumSkeleton width="92%" height={14} />
                  <PremiumSkeleton width="78%" height={14} />
                </Stack>
              </Box>

              {/* Action Buttons Group */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  flexShrink: 0,
                  alignItems: "center",
                }}
              >
                <PremiumSkeleton width={100} height={38} sx={{ borderRadius: 99 }} />
                <PremiumSkeleton width={90} height={38} sx={{ borderRadius: 99 }} />
                <PremiumSkeleton width={90} height={38} sx={{ borderRadius: 99 }} />
              </Box>
            </Box>
          </Card>
        ))}
      </Stack>
    </Box>
  );
});

/* ─── ApplicationDetailSkeleton ────────────────────────────────────────── */
export const ApplicationDetailSkeleton = memo(function ApplicationDetailSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Loading application detail"
      sx={{ ...safeContainerSx, maxWidth: 896, mx: "auto", display: "grid", gap: 3, px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <PremiumSkeleton width={50} height={16} />
        <PremiumSkeleton width={8} height={16} />
        <PremiumSkeleton width={130} height={16} />
      </Stack>

      <Card elevation={0} sx={{ ...cardSafeSx, p: 2.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <PremiumSkeleton width={60} height={12} />
            <PremiumSkeleton width={120} height={26} sx={{ mt: 0.5 }} />
          </Box>
          <PremiumSkeleton width={200} height={36} sx={{ borderRadius: 2 }} />
        </Box>
      </Card>

      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 3 }}>
            <PremiumSkeleton width="30%" height={20} sx={{ mb: 2 }} />
            {Array.from({ length: 3 }).map((_, j) => (
              <Box key={j} sx={{ mb: 1.5 }}>
                <PremiumSkeleton width="24%" height={12} />
                <PremiumSkeleton width="55%" height={16} sx={{ mt: 0.5 }} />
              </Box>
            ))}
            {i === 1 && (
              <PremiumSkeleton width={110} height={36} sx={{ borderRadius: 2, mt: 1 }} />
            )}
          </Card>
        ))}
      </Box>

      <Card className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 3 }}>
        <PremiumSkeleton width="20%" height={20} sx={{ mb: 2 }} />
        <PremiumSkeleton width="100%" height={14} />
        <PremiumSkeleton width="95%" height={14} sx={{ mt: 1 }} />
        <PremiumSkeleton width="80%" height={14} sx={{ mt: 1 }} />
        <PremiumSkeleton width="60%" height={14} sx={{ mt: 1 }} />
      </Card>

      <PremiumSkeleton width={170} height={38} sx={{ borderRadius: 2 }} />
    </Box>
  );
});

/* ─── SavedJobsSkeleton ────────────────────────────────────────────────── */
export const SavedJobsSkeleton = memo(function SavedJobsSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Loading saved jobs"
      sx={{ ...safeContainerSx, maxWidth: 1280, mx: "auto", display: "grid", gap: 3, px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
        <Box>
          <PremiumSkeleton width={160} height={28} />
          <PremiumSkeleton width={300} height={16} sx={{ mt: 1 }} />
        </Box>
        <PremiumSkeleton width={140} height={38} sx={{ borderRadius: 99 }} />
      </Box>

      <Stack spacing={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 2.5,
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Title & Badge */}
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1, flexWrap: "wrap", gap: 1 }}>
                  <PremiumSkeleton width="45%" height={26} />
                  <PremiumSkeleton width={60} height={22} sx={{ borderRadius: "8px" }} />
                  <PremiumSkeleton width={75} height={22} sx={{ borderRadius: "8px" }} />
                </Stack>
                
                {/* Details row */}
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
                  <PremiumSkeleton width="15%" height={16} />
                  <PremiumSkeleton width="10%" height={16} />
                  <PremiumSkeleton width="20%" height={16} />
                </Stack>

                {/* Skills tags */}
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mb: 1 }}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <PremiumSkeleton key={j} width={70 + (j % 2) * 15} height={22} sx={{ borderRadius: "8px" }} />
                  ))}
                </Stack>
              </Box>

              {/* Action Buttons Group */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "row", sm: "column" },
                  gap: 1,
                  width: { xs: "100%", sm: 140 },
                  flexShrink: 0,
                }}
              >
                <PremiumSkeleton sx={{ flex: 1, height: 38, borderRadius: 99 }} />
                <PremiumSkeleton sx={{ flex: 1, height: 38, borderRadius: 99 }} />
              </Box>
            </Box>
          </Card>
        ))}
      </Stack>
    </Box>
  );
});

/* ─── ProfileEditSkeleton (Talent & Company) ───────────────────────────── */
export const ProfileEditSkeleton = memo(function ProfileEditSkeleton({ isCompany = false }) {
  const containerClass = isCompany
    ? "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8";

  return (
    <div role="status" aria-busy="true" aria-label="Loading profile" className={containerClass}>
      {/* Header Block (Matches the title and buttons of My Profile page) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="w-full md:w-auto">
          <PremiumSkeleton width={160} height={28} />
          <PremiumSkeleton width={300} height={16} sx={{ mt: 1 }} />
        </div>
        <div className="flex flex-row gap-3 w-full md:w-auto">
          <PremiumSkeleton width={150} height={38} sx={{ borderRadius: 99 }} />
          <PremiumSkeleton width={120} height={38} sx={{ borderRadius: 99 }} />
        </div>
      </div>

      {/* Main Profile Grid (Matches view mode layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Core Info & Preferences */}
        <div className="space-y-6 lg:col-span-1">
          {/* Core Info Card */}
          <div className="glass-panel p-6 text-center flex flex-col items-center">
            <PremiumSkeleton
              width={112}
              height={112}
              sx={{ borderRadius: "50%" }}
            />
            <PremiumSkeleton width="60%" height={20} sx={{ mt: 2 }} />
            <PremiumSkeleton width="75%" height={16} sx={{ mt: 1.25 }} />
            <PremiumSkeleton width="50%" height={14} sx={{ mt: 0.75 }} />
            
            <PremiumSkeleton width={100} height={24} sx={{ mt: 2.5, borderRadius: 99 }} />
            
            <div className="w-full border-t border-black/5 dark:border-white/5 mt-5 pt-5 flex flex-col gap-3 text-left">
              <PremiumSkeleton width="80%" height={14} />
              <PremiumSkeleton width="60%" height={14} />
              
              {/* Social Circles */}
              <div className="flex gap-2 pt-2 justify-center">
                <PremiumSkeleton width={36} height={36} sx={{ borderRadius: "50%" }} />
                <PremiumSkeleton width={36} height={36} sx={{ borderRadius: "50%" }} />
                <PremiumSkeleton width={36} height={36} sx={{ borderRadius: "50%" }} />
              </div>
            </div>
          </div>

          {/* Preferences/Skills Card */}
          <div className="glass-panel p-6 space-y-5">
            <div>
              <PremiumSkeleton width="30%" height={12} sx={{ mb: 2.5 }} />
              <div className="flex flex-wrap gap-1.5">
                <PremiumSkeleton width={60} height={22} sx={{ borderRadius: 99 }} />
                <PremiumSkeleton width={75} height={22} sx={{ borderRadius: 99 }} />
                <PremiumSkeleton width={65} height={22} sx={{ borderRadius: 99 }} />
              </div>
            </div>

            <div>
              <PremiumSkeleton width="45%" height={12} sx={{ mb: 2.5 }} />
              <div className="flex flex-wrap gap-1.5">
                <PremiumSkeleton width={80} height={22} sx={{ borderRadius: 99 }} />
                <PremiumSkeleton width={68} height={22} sx={{ borderRadius: 99 }} />
              </div>
            </div>

            <div>
              <PremiumSkeleton width="45%" height={12} sx={{ mb: 2.5 }} />
              <div className="flex flex-wrap gap-1.5">
                <PremiumSkeleton width={72} height={22} sx={{ borderRadius: 99 }} />
                <PremiumSkeleton width={84} height={22} sx={{ borderRadius: 99 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Sections */}
        <div className="space-y-6 lg:col-span-2">
          {/* Biography Card */}
          <div className="glass-panel p-6">
            <PremiumSkeleton width="18%" height={18} sx={{ mb: 3 }} />
            <PremiumSkeleton width="100%" height={14} />
            <PremiumSkeleton width="35%" height={14} sx={{ mt: 1 }} />
          </div>

          {/* Experience Card */}
          <div className="glass-panel p-6">
            <PremiumSkeleton width="22%" height={18} sx={{ mb: 4 }} />
            
            <div className="space-y-6">
              {[1, 2].map((idx) => (
                <div key={idx} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-200 dark:before:bg-white/10">
                  <div className="absolute left-[-3px] top-[7px] w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <PremiumSkeleton width={240} height={16} />
                    <PremiumSkeleton width={120} height={14} />
                  </div>
                  <div className="pl-3.5 display-flex flex-col gap-1 mt-2">
                    <PremiumSkeleton width="85%" height={14} />
                    <PremiumSkeleton width="60%" height={14} sx={{ mt: 1 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Card */}
          <div className="glass-panel p-6">
            <PremiumSkeleton width="18%" height={18} sx={{ mb: 4 }} />
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((idx) => (
                <div key={idx} className="p-4 bg-white/40 dark:bg-white/[0.02] border border-white/60 dark:border-white/[0.06] rounded-xl flex flex-col justify-between h-full">
                  <div>
                    <PremiumSkeleton width="60%" height={16} />
                    <PremiumSkeleton width="94%" height={14} sx={{ mt: 2 }} />
                    <PremiumSkeleton width="50%" height={14} sx={{ mt: 1 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

/* ─── JobEditSkeleton ──────────────────────────────────────────────────── */
export const JobEditSkeleton = memo(function JobEditSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Loading job editor"
      sx={{ ...safeContainerSx }}
    >
      <Box sx={{ borderBottom: "1px solid var(--app-border)", px: { xs: 2, sm: 3, lg: 4 } }}>
        <Box sx={{ maxWidth: 896, mx: "auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <PremiumSkeleton width={160} height={22} />
          <PremiumSkeleton width={50} height={16} />
        </Box>
      </Box>

      <Box sx={{ maxWidth: 896, mx: "auto", px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
        <Card className="glass-card" elevation={0} sx={{ ...cardSafeSx, p: 3 }}>
          <Stack spacing={3}>
            <Box>
              <PremiumSkeleton width="14%" height={18} sx={{ mb: 2 }} />
              <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 2, mb: 2 }} />
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Box key={i}>
                    <PremiumSkeleton width="35%" height={12} sx={{ mb: 0.75 }} />
                    <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 2 }} />
                  </Box>
                ))}
              </Box>
              <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: "center" }}>
                <PremiumSkeleton width={18} height={18} sx={{ borderRadius: 1 }} />
                <PremiumSkeleton width={160} height={14} />
              </Stack>
            </Box>

            <Box>
              <PremiumSkeleton width="10%" height={18} sx={{ mb: 2 }} />
              {Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <PremiumSkeleton width="18%" height={12} sx={{ mb: 0.75 }} />
                  <PremiumSkeleton width="100%" height={i === 0 ? 90 : 70} sx={{ borderRadius: 2 }} />
                </Box>
              ))}
            </Box>

            <Box>
              <PremiumSkeleton width="22%" height={18} sx={{ mb: 2 }} />
              <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 2, mb: 2 }} />
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
                <Box>
                  <PremiumSkeleton width="35%" height={12} sx={{ mb: 0.75 }} />
                  <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 2 }} />
                </Box>
                <Box>
                  <PremiumSkeleton width="35%" height={12} sx={{ mb: 0.75 }} />
                  <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 2 }} />
                </Box>
              </Box>
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, mt: 2 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Box key={i}>
                    <PremiumSkeleton width="40%" height={12} sx={{ mb: 0.75 }} />
                    <PremiumSkeleton width="100%" height={38} sx={{ borderRadius: 2 }} />
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2, borderTop: "1px solid var(--app-border)" }}>
              <PremiumSkeleton width={120} height={38} sx={{ borderRadius: 99 }} />
            </Box>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
});

/* ─── CompanyApplicationsSkeleton ──────────────────────────────────────── */
export const CompanyApplicationsSkeleton = memo(function CompanyApplicationsSkeleton({ appsOnly = false }) {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Loading applications"
      sx={{ ...safeContainerSx, display: "grid", gap: 3 }}
    >
      {/* 1. Job Selection & Selected Job Details Card Skeleton */}
      {!appsOnly && (
        <Card
          className="glass-card"
          elevation={0}
          sx={{ ...cardSafeSx, p: 2.5, mb: 1 }}
        >
          {/* Dropdown label & input */}
          <PremiumSkeleton width="80px" height={12} sx={{ mb: 1 }} />
          <PremiumSkeleton width={360} height={38} sx={{ borderRadius: "12px" }} />
          
          {/* Divider & Sub-info details */}
          <Box
            sx={{
              mt: 2.5,
              pt: 2,
              borderTop: "1px solid var(--app-border)",
              display: "flex",
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <PremiumSkeleton width={180} height={18} />
            <PremiumSkeleton width={6} height={6} sx={{ borderRadius: 99 }} />
            <PremiumSkeleton width={80} height={14} />
            <PremiumSkeleton width={6} height={6} sx={{ borderRadius: 99 }} />
            <PremiumSkeleton width={90} height={14} />
          </Box>
        </Card>
      )}

      {/* 2. Pipeline Kanban Board Skeleton */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: {
            xs: "1fr",
            xl: "repeat(4, 1fr)",
          },
        }}
      >
        {["Applied", "Under Review", "Shortlisted", "Rejected"].map((stage, i) => (
          <Box
            key={stage}
            sx={{
              display: "flex",
              minHeight: 390,
              flexDirection: "column",
              borderRadius: "16px",
              border: "1px solid var(--app-border)",
              background: "var(--app-glass-strong)",
              overflow: "hidden",
            }}
          >
            {/* Stage Column Header */}
            <Box
              sx={{
                p: 1.5,
                borderBottom: "1px solid var(--app-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PremiumSkeleton width={10} height={10} sx={{ borderRadius: 99 }} />
                <PremiumSkeleton width={80} height={16} />
              </Box>
              <PremiumSkeleton width={24} height={20} sx={{ borderRadius: 99 }} />
            </Box>

            {/* Candidate Cards list inside stage column */}
            <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
              {Array.from({ length: i === 0 ? 2 : i === 1 ? 1 : 0 }).map((_, j) => (
                <Card
                  key={j}
                  className="glass-card"
                  elevation={0}
                  sx={{
                    ...cardSafeSx,
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <PremiumSkeleton width="65%" height={18} />
                  <PremiumSkeleton width="40%" height={12} sx={{ mt: 0.5 }} />
                  
                  {/* Dropdown status update select */}
                  <PremiumSkeleton width="100%" height={38} sx={{ mt: 1, borderRadius: "12px" }} />
                  
                  {/* Drag and drop help text */}
                  <PremiumSkeleton width="85%" height={10} sx={{ mt: 0.5 }} />
                </Card>
              ))}
              
              {/* If no candidates, render a dashed placeholder representation */}
              {(i === 2 || i === 3) && (
                <Box
                  sx={{
                    display: "flex",
                    height: 96,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "12px",
                    border: "1px dashed var(--app-border)",
                    p: 2,
                  }}
                >
                  <PremiumSkeleton width="50%" height={12} />
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
});

export const DashboardSkeleton = memo(function DashboardSkeleton() {
  return <TalentDashboardSkeleton />;
});

export const FullPageLoader = memo(function FullPageLoader() {
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-busy="true"
      sx={{
        ...safeContainerSx,
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack spacing={1.5} sx={{ width: 240, alignItems: "center" }}>
        <PremiumSkeleton width={48} height={48} sx={{ borderRadius: 999 }} />
        <PremiumSkeleton width="52%" height={16} />
      </Stack>
      <Box component="span" sx={srOnlySx}>
        Loading
      </Box>
    </Box>
  );
});
