import { memo } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
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
      <Grid container spacing={3} sx={safeContainerSx}>
        <Grid item xs={12} lg={8} sx={{ minWidth: 0 }}>
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
        </Grid>

        <Grid item xs={12} lg={4} sx={{ minWidth: 0 }}>
          <ProfileCardSkeleton />
        </Grid>
      </Grid>
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

      <Grid container spacing={2} sx={safeContainerSx}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid key={index} item xs={6} lg={3} sx={{ minWidth: 0 }}>
            <StatsCardSkeleton />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={safeContainerSx}>
        <Grid item xs={12} xl={5} sx={{ minWidth: 0 }}>
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
        </Grid>

        <Grid item xs={12} xl={7} sx={{ minWidth: 0 }}>
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
        </Grid>
      </Grid>

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

        <Grid container spacing={2} sx={safeContainerSx}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Grid key={index} item xs={6} lg={2.4} sx={{ minWidth: 0 }}>
              <StatsCardSkeleton />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={safeContainerSx}>
          <Grid xs={12} xl={8} sx={{ minWidth: 0 }}>
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
          </Grid>

          <Grid item xs={12} xl={4} sx={{ minWidth: 0 }}>
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
          </Grid>
        </Grid>
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

      <Grid container spacing={2} sx={safeContainerSx}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid key={index} item xs={12} sm={6} xl={3} sx={{ minWidth: 0 }}>
            <StatsCardSkeleton />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={safeContainerSx}>
        <Grid item xs={12} xl={7} sx={{ minWidth: 0 }}>
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
        </Grid>

        <Grid xs={12} xl={5} sx={{ minWidth: 0 }}>
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
        </Grid>
      </Grid>
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
